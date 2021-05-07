/* eslint-disable no-console */

export const createLogger = (level: boolean | string[], console?: Console) => {
  const ctxConsole = console || global.console;

  if (!level) {
    return {
      log: (...args: unknown[]) => null,
      warn: (...args: unknown[]) => null,
    };
  }

  if (level && typeof level === 'boolean') {
    return {
      log: ctxConsole.log.bind(null, '[MongooseNamingStrategy]'),
      warn: ctxConsole.warn.bind(null, '[MongooseNamingStrategy]'),
    };
  }

  const result: Record<string, (...args: unknown[]) => void> = {};

  ['log', 'warn']
    .map((e) => ({
      method: e,
      enable: level.indexOf(e) !== -1,
    }))
    .forEach(({ enable, method }) => {
      result[method] = enable
        ? (<any>ctxConsole)[method].bind(null, '[MongooseNamingStrategy]')
        : (...args: unknown[]) => null;
    });

  return result;
};
