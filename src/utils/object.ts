export const isObject = (obj: unknown): boolean =>
  (obj &&
    typeof obj === 'object' &&
    obj !== null &&
    !!Object.keys(obj).length) as boolean;
