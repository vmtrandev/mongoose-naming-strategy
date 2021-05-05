export const isObject = (obj: unknown): boolean =>
  (obj &&
    typeof obj === 'object' &&
    obj !== null &&
    !!Object.keys(obj).length) as boolean;

export const setDeepProps = (
  receiver: Record<string, unknown>,
  strProps: string,
  value: unknown
) => {
  const props = strProps.split('.');
  if (props.length === 1) {
    // eslint-disable-next-line no-param-reassign
    receiver[props[0]] = value;
    return;
  }

  (props as any).reduce(
    (acc: Record<string, unknown>, cur: string, idx: any, arr: any) => {
      if (idx === arr.length - 1) {
        acc[cur] = value;
        return acc[cur];
      }

      if (!acc[cur]) acc[cur] = {};
      return acc[cur];
    },
    receiver
  );
};

export const getDeepProps = <T>(
  target: Record<string, unknown>,
  strProps: string
): T | undefined => {
  const props = strProps.split('.');
  if (props.length === 1) {
    return target[props[0]] as T;
  }

  let cur: unknown = target[props[0]];

  for (let i = 1; i < props.length - 1; i++) {
    if (typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[props[i]];
  }
  return (cur as Record<string, unknown>)[props[props.length - 1]] as T;
};
