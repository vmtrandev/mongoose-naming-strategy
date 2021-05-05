export const isMongooseExtendedDeclaration = (obj: unknown): boolean => (
    typeof obj === 'object' &&
    obj !== null &&
    obj.constructor.name === 'Object' &&
    typeof (obj as Record<string, unknown>).type === 'object' &&
    (obj as Record<string, unknown>).type === 'Function'
  );
