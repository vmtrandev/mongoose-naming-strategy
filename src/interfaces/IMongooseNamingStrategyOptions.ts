import { ENaming } from './INamingEnum';
import { ISchemaMapper } from './ISchemaMapper';

export interface IMongooseNamingStrategyOptions {
  autoload: boolean;
  schemaType: ENaming;

  exclusion?: string[];
  mappers?: ISchemaMapper<unknown>[];
  readonly runSignature?: unique symbol;

  camelToSnake?: (prop: string) => string;
  snakeToCamel?: (prop: string) => string;
}
