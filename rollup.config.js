import commonJs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import VuePlugin from 'rollup-plugin-vue';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const name = 'vue-ld';

export default {
  input: 'src/index.js',
  external: ['launchdarkly-js-client-sdk', 'lodash'],
  output: [
    {
      name,
      format: 'cjs',
      file: 'dist/index.cjs.js',
      exports: 'auto',
    },
    {
      name,
      format: 'es',
      file: 'dist/index.es.js',
    },
  ],
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    commonJs({
      include: 'node_modules/**',
    }),
    VuePlugin(),
    babel({
      babelrc: false,
      presets: [
        [
          '@vue/babel-preset-app',
          {
            debug: true,
            targets: { browsers: ['> 1%', 'last 2 versions', 'ie > 9'] },
            modules: false,
          },
        ],
      ],
      exclude: 'node_modules/**',
      babelHelpers: 'runtime',
    }),
  ],
  watch: {
    exclude: ['node_modules/**'],
  },
};
