module.exports = {
  jest: {
    moduleFileExtensions: ['js', 'json', 'vue'],
    transform: {
      '.*\\.(vue)$': 'vue-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: ['**/*.{js,vue}', '!**/node_modules/**'],
    coverageReporters: ['json', 'lcov', 'clover', 'html'],
  },
};
