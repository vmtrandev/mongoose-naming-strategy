import { Schema } from 'mongoose';

export interface ISchemaMapper<T> {
  schema: Schema;
  mapper: Partial<TFieldsToProp<T>>;
}

/**
 * Map spefic key defined in schema to another
 */
export type TFieldsToProp<T> = {
  [key in keyof T]: string;
};
