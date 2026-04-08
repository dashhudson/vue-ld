const camelCase = (str) => str.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase());

export const formatFlags = (flags) => Object.fromEntries(
    Object.keys(flags).map((key) => [camelCase(key), flags[key]])
  );

export const rethrow = (e) => {
  // Intended to be mocked in tests to avoid uncaught promise rejections in dependencies
  throw e;
};
