module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    // Prevent jest-environment-jsdom from using the "browser" package export condition,
    // which causes packages like @vue/test-utils to load their browser bundles instead
    // of their Node.js-compatible CJS bundles.
    customExportConditions: ['node', 'node-addons'],
  },
  setupFiles: ['./tests/setup.js'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '.+\\.(css|styl|less|sass|scss|jpg|jpeg|png|svg|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|avif)$':
      'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: ['**/*.{js,vue}', '!**/node_modules/**'],
  coveragePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/', '<rootDir>/tests/'],
  coverageReporters: ['json', 'lcov', 'clover', 'html'],
};
