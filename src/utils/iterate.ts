export const recursiveIter = (
  obj: Record<string, unknown>,
  cb: (key: string, value: unknown) => void,
  valueChecker?: (value: unknown) => false | unknown,
  root?: string
) => {
  obj &&
    Object.entries(obj).forEach(([key, value]) => {
      if (valueChecker) {
        const result = valueChecker(value);
        if (result)
          return recursiveIter(
            result as Record<string, unknown>,
            cb,
            valueChecker,
            root ? `${root}.${key}` : key
          );

        return cb(root ? `${root}.${key}` : key, value);
      }

      if (typeof value === 'object' && value && Object.keys(value).length)
        return recursiveIter(
          value as Record<string, unknown>,
          cb,
          valueChecker,
          root ? `${root}.${key}` : key
        );

      return cb(root ? `${root}.${key}` : key, value);
    });
};
