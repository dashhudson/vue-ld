export const defaultVueLdOptions = {
  clientSideId: 'superSecretToken',
  context: {
    kind: 'user',
    key: 'anonymous',
    email: 'anonymous@test.com',
    name: 'Anonymous User',
  },
};

// Simple key-value format compatible with the SDK's bootstrap option and allFlags()
export const flagsResponse = {
  myFlag: true,
};
