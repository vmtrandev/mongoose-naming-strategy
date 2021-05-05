/* eslint-disable func-names */
/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
import { Schema } from 'mongoose';
import {
  ISchemaMapper,
  ENaming,
  IMongooseNamingStrategyOptions,
  TProcessTransform,
  IKeysMapper,
} from './interfaces';
import { SIGNATURE, KEYS } from './constants';
import {
  camelToSnake,
  snakeToCamel,
  makeTransform,
  TRuntimeTransformMethod,
  deepTransform,
  isObject,
} from './utils';

export default class MongooseNamingStrategy {
  private autoload: boolean;

  private exclusion: string[];

  private schemaNamingDefination: ENaming;

  private schemaMappers: ISchemaMapper<unknown>[];

  private runSignature: symbol;

  private handlePreTransform: TProcessTransform;

  private handlePostTransform: TProcessTransform;

  constructor(opts: IMongooseNamingStrategyOptions) {
    const {
      autoload,
      exclusion,
      schemaType,
      mappers,
      runSignature,
      camelToSnake: customCamelToSnake,
      snakeToCamel: customSnakeToCamel,
    } = opts;

    this.autoload = autoload;

    this.schemaNamingDefination = schemaType;

    if (schemaType === ENaming.CAMEL_CASE) {
      this.handlePreTransform = this.generateNamingTransformation(
        customCamelToSnake || camelToSnake
      );
      this.handlePostTransform = this.generateNamingTransformation(
        customSnakeToCamel || snakeToCamel
      );
    } else {
      this.handlePreTransform = this.generateNamingTransformation(
        customSnakeToCamel || snakeToCamel
      );
      this.handlePostTransform = this.generateNamingTransformation(
        customCamelToSnake || camelToSnake
      );
    }

    if (exclusion) this.exclusion = exclusion;
    else this.exclusion = ['_id', '_v'];

    if (mappers) this.schemaMappers = mappers;
    else this.schemaMappers = [];

    if (runSignature) this.runSignature = runSignature;
    else this.runSignature = SIGNATURE.RUN;
  }

  private generateNamingTransformation(
    fn: TProcessTransform
  ): TProcessTransform {
    return (str) => {
      if (this.exclusion.find((e) => e === str)) return str;
      return fn(str);
    };
  }

  private makePreTransform(schema: Schema) {
    if (
      Object.getOwnPropertySymbols(schema).find((k) => k === KEYS.KEY_MAPPERS)
    )
      return;

    const { obj } = schema;

    const keyMappers = Object.keys(obj).reduce<IKeysMapper>(
      (acc, cur) => ({
        ...acc,
        [this.handlePreTransform(cur)]: cur,
      }),
      {}
    );

    Object.defineProperty(schema, KEYS.KEY_MAPPERS, {
      writable: false,
      value: keyMappers,
    });

    Object.defineProperty(schema, KEYS.FN_TRANSFORM_JSON, {
      writable: false,
      value: makeTransform(keyMappers, { toJSON: true }),
    });

    Object.defineProperty(schema, KEYS.FN_TRANSFORM_OBJ, {
      writable: false,
      value: makeTransform(keyMappers, { toJSON: true }),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private attachVirtual(schema: Schema) {
    if ((<any>schema)[KEYS.HAS_VIRTUAL]) {
      return;
    }

    const mappers = <IKeysMapper>(<any>schema)[KEYS.KEY_MAPPERS];

    if (!mappers) return;

    Object.entries(mappers).forEach(([key, value]) => {
      if (key !== value) {
        schema
          .virtual(key)
          .get(function (this: any) {
            return this[value];
          })
          .set(function (this: any, val: unknown) {
            this[value] = val;
          });
      }
    });

    Object.defineProperty(schema, KEYS.HAS_VIRTUAL, {
      writable: false,
      value: true,
    });
  }

  private attachTransform(schema: Schema) {
    const transformJSON = (<any>schema)[
      KEYS.FN_TRANSFORM_JSON
    ] as TRuntimeTransformMethod;

    const transformObj = (<any>schema)[
      KEYS.FN_TRANSFORM_OBJ
    ] as TRuntimeTransformMethod;

    schema.set('toJSON', {
      transform(doc: Record<string, unknown>) {
        return transformJSON(doc);
      },
    });

    if (this.autoload) {
      schema.set('toObject', {
        transform(doc: Record<string, unknown>) {
          return transformObj(doc);
        },
      });
    }
  }

  private attachDistinctHook(schema: Schema) {
    const self = this;
    schema.pre('distinct', function (next: any) {
      const distinct = (<any>this)._distinct;

      if (distinct && typeof distinct === 'string') {
        (<any>this)._distinct = self.handlePostTransform(distinct);
      }

      next();
    });
  }

  private attachCountHook(schema: Schema) {
    const self = this;
    schema.pre('countDocuments', function (next: any) {
      const conditions = (<any>this)._conditions;
      if (isObject(conditions)) {
        (<any>this)._conditions = deepTransform(
          conditions,
          self.handlePostTransform
        );
      }

      next();
    });
  }

  private attachPostLeanHook(schema: Schema) {
    const self = this;
    // eslint-disable-next-line func-names
    schema.post(/^find/, function (res, next: any) {
      if (!(<any>this)._mongooseOptions?.lean) {
        return next();
      }

      if (Array.isArray(res)) {
        for (let i = 0; i < res.length; i++) {
          const doc = res[i];
          res[i] = deepTransform(doc, self.handlePreTransform);
        }
      }

      if (isObject(res)) {
        deepTransform(res, self.handlePreTransform, true);
      }
      next();
    });
  }

  private attachDocumentMiddlewares(schema: Schema) {
    const self = this;
    schema.pre(/^find/, function (next) {
      const conditions = (<any>this)._conditions;
      const fields = (<any>this)._fields;
      const { options } = <any>this;

      const updateDoc = (<any>this)._update;

      if (isObject(conditions)) {
        (<any>this)._conditions = deepTransform(
          conditions,
          self.handlePostTransform
        );
      }

      if (isObject(fields)) {
        (<any>this)._fields = deepTransform(fields, self.handlePostTransform);
      }

      if (isObject(options)) {
        Object.entries(options).forEach(([key, value]) => {
          if (isObject(value)) {
            (<any>this).options[key] = deepTransform(
              <Record<string, unknown>>value,
              self.handlePostTransform
            );
          } else (<any>this).options[key] = value;
        });
      }

      if (isObject(updateDoc)) {
        (<any>this)._update = deepTransform(
          updateDoc,
          self.handlePostTransform
        );
      }

      next();
    });
  }

  public getPlugin(): (schema: Schema) => void {
    return (schema) => {
      this.makePreTransform(schema);
      this.attachVirtual(schema);
      this.attachTransform(schema);
      this.attachCountHook(schema);
      this.attachDistinctHook(schema);
      this.attachDocumentMiddlewares(schema);
      this.attachPostLeanHook(schema);
    };
  }
}
