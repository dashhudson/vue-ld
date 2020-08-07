import { camelCase } from 'lodash';

export const formatFlags = (flags) => {
  return Object.fromEntries(
    Object.keys(flags).map((key) => {
      return [camelCase(key), flags[key]];
    })
  );
};
