/* eslint-disable @typescript-eslint/no-unused-expressions */
export type TCaseTransform = (str: string) => string;

export const snakeToCamel = (str: string) =>
  str.replace(/([_-]\w)/g, (m) => m[1].toUpperCase());

export const camelToSnake = (str: string) =>
  str
    .replace(/[\w]([A-Z])/g, (m) => `${m[0]  }_${  m[1]}`)
    .replace(/[A-Z]([A-Z])/g, (m) => `${m[0]  }_${  m[1]}`)
    .toLowerCase();

export type TRuntimeTransformMethod = (
  target: Record<string, unknown>
) => Record<string, unknown>;

export interface IMakeTransformMethodOptions {
  fieldNameFromMap?: 'key' | 'value';
  toJSON?: boolean;
}

export const makeTransform = (
  meta: Record<string, string>,
  opts: IMakeTransformMethodOptions = {}
): TRuntimeTransformMethod => {
  const { toJSON } = opts;
  const target = 'fnTarget';

  const body = `return { \n ${
    toJSON
      ? Object.entries(meta)
          .map(
            ([key, value]) =>
              `${key}: Array.isArray(${target}.${value}) ? 
              ${target}.${value}.map(e => typeof e === 'object' && e !== null && e.toJSON instanceof Function ? e.toJSON() : e) :
              typeof ${target}.${value} === 'object' && ${target}.${value} !== null && ${target}.${value}.toJSON instanceof Function ?
              ${target}.${value}.toJSON() :
              ${target}.${value}`
          )
          .join(',\n')
      : Object.entries(meta)
          .map(([key, value]) => `${key}: ${target}.${value}`)
          .join(',\n')
  } };`;

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(target, body) as TRuntimeTransformMethod;
};

export const deepTransform = (
  target: Record<string, unknown>,
  handler: TCaseTransform,
  mutate?: boolean
): Record<string, unknown> =>
  Object.entries(target).reduce<Record<string, unknown>>(
    (acc, [key, val]) => {
      const newKey = handler(key);

      if (
        typeof val === 'object' &&
        val !== null &&
        Object.getOwnPropertyNames(val).findIndex((e) => e === '_bsontype') !==
          -1
      ) {
        acc[newKey] = val;
        mutate && key !== newKey && delete acc[key];

        return acc;
      }

      if (Array.isArray(val)) {
        const newVal = val.map((e) => {
          if (typeof e !== 'object') {
            return e;
          }

          return deepTransform(e, handler);
        });

        acc[newKey] = newVal as any;
        mutate && key !== newKey && delete acc[key];
        return acc;
      }

      if (typeof val === 'object' && val !== null && Object.keys(val).length) {
        const newVal = deepTransform(<Record<string, unknown>>val, handler);
        acc[newKey] = newVal;
        mutate && key !== newKey && delete acc[key];
        return acc;
      }

      acc[newKey] = val;
      mutate && key !== newKey && delete acc[key];
      return acc;
    },
    mutate ? target : {}
  );
