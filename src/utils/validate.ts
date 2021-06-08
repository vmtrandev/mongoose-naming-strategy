export const isMongooseExtendedDeclaration = (obj: unknown): boolean =>
  typeof obj === 'object' &&
  obj !== null &&
  obj.constructor.name === 'Object' &&
  typeof (obj as Record<string, unknown>).type === 'object' &&
  (obj as Record<string, unknown>).type === 'Function';

export const isObjectId = (obj: unknown): boolean => {
  if (typeof obj !== 'object') return false;

  if (obj === null) return false;

  if (
    (<Record<string, unknown>>obj)._bsontype &&
    (<Record<string, unknown>>obj)._bsontype === 'ObjectID' &&
    (<Record<string, unknown>>obj).id
  ) {
    return true;
  }

  return false;
};
