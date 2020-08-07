import commonJs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

const name = 'vue-ld';

export default {
  input: 'src/index.js',
  external: ['launchdarkly-js-client-sdk', 'lodash'],
  output: [
    {
      name,
      format: 'cjs',
      file: 'dist/index.cjs.js',
    },
    {
      name,
      format: 'es',
      file: 'dist/index.es.js',
    },
  ],
  plugins: [
    commonJs({
      include: 'node_modules/**',
    }),
    babel({
      babelrc: false,
      presets: [
        [
          '@babel/env',
          {
            debug: true,
            targets: { browsers: ['> 1%', 'last 2 versions', 'ie > 9'] },
            modules: false,
          },
        ],
      ],
      exclude: 'node_modules/**',
    }),
  ],
  watch: {
    exclude: ['node_modules/**'],
  },
};
