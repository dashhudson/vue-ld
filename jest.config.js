const { isVue3 } = require('vue-demi');

const vueVersion = isVue3 ? '3' : '2';

let vueJest = null
try {
  vueJest = require.resolve(`@vue/vue${vueVersion}-jest`)
} catch (e) {
  throw new Error(`Cannot resolve "@vue/vue${vueVersion}-jest" module. Please make sure you have installed "@vue/vue${vueVersion}-jest" as a dev dependency.`)
}

module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': vueJest,
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
