import { ENaming } from './INamingEnum';
import { ISchemaMapper } from './ISchemaMapper';

export interface IMongooseNamingStrategyOptions {
  autoload: boolean;
  schemaType: ENaming;

  exclusions?: string[];
  mappers?: ISchemaMapper<unknown>[];
  readonly runSignature?: unique symbol;
  readonly leanSignature?: unique symbol;

  logger?: boolean | string[];

  camelToSnake?: (prop: string) => string;
  snakeToCamel?: (prop: string) => string;
}
