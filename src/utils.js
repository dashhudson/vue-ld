import camelCase from 'lodash/camelCase';

export const formatFlags = (flags) => {
  return Object.fromEntries(
    Object.keys(flags).map((key) => {
      return [camelCase(key), flags[key]];
    })
  );
};

export const rethrow = (e) => {
  // Intended to be mocked in tests to avoid uncaught promise rejections in dependencies
  throw e;
};
