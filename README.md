# Vue LaunchDarkly

[![Mentioned in Awesome Vue.js](https://awesome.re/mentioned-badge.svg)](https://github.com/vuejs/awesome-vue#integrations)
[![Maintainability](https://api.codeclimate.com/v1/badges/d87da39dfb63340702bd/maintainability)](https://codeclimate.com/github/dashhudson/vue-ld/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d87da39dfb63340702bd/test_coverage)](https://codeclimate.com/github/dashhudson/vue-ld/test_coverage) [![npm version](https://img.shields.io/npm/v/vue-ld?color=%23d6b034)](https://www.npmjs.com/package/vue-ld) [![Last Commit](https://img.shields.io/github/last-commit/dashhudson/vue-ld?color=%23d6b034)](https://github.com/dashhudson/vue-ld/graphs/commit-activity)
[![Licence](https://img.shields.io/github/license/dashhudson/vue-ld?color=%23d6b034)](https://github.com/dashhudson/vue-ld/blob/dev/LICENSE.txt) [![Stars](https://img.shields.io/github/stars/dashhudson/vue-ld?color=%23d6b034&logoColor=%23d6b034)](https://github.com/dashhudson/vue-ld)

A simple wrapper around the [js-client-sdk](https://github.com/launchdarkly/js-client-sdk) that provides observable feature flags, a ready state to ensure all feature flags are up to date, and routing utilities.

## Usage

### Installation

```bash
$ npm install --save vue-ld launchdarkly-js-client-sdk
```

Main.js

```javascript
import Vue from 'vue';
import { VueLd } from 'vue-ld';

Vue.use(VueLd, {
  clientSideId: 'YOUR_CLIENT_SIDE_ID',
  user: {
    key: '...',
    email: '...',
    name: '...',
  },
  options: {
    // Standard LaunchDarkly JavaScript SDK options
  },
});
```

#### Additional Plugin Options

| key                   | description                                                                                                                            | default     | type               |
| :-------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------ |
| `readyBeforeIdentify` | If set to false, the `$ld.ready` will only be true after identify has been called.                                                     | `true`      | `Boolean`          |
| `flagsStub`           | If provided, the ldClient will not be initialized the and `$ld.flags` will set to the provided stub; this can be helpful in e2e tests. | `undefined` | `Object` / `Proxy` |

### Template

```html
<template>
  <div v-if="$ld.ready && $ld.flags.yourFlag">
    // Render after feature flags are ready
  </div>
</template>
```

### Identify

A wrapper around `ldClient.identify` to allow for

```javascript
export default {
  methods: {
    vueLdCallback() {
      // ...
    },
  },
  watch: {
    user(to) {
      const options = {
        newUser: to,
      };
      this.$ld.identify(options, this.vueLdCallback);
    },
  },
};
```

#### Arguments

| key             | description                                                                     | type       |
| :-------------- | ------------------------------------------------------------------------------- | ---------- |
| `options`       | The standard `ldclient.identify` arguments.                                     | `object`   |
| `vueLdCallback` | A method called after the identify promise resolves; bound to the \$ld context. | `function` |

### Redirect Mixin

Adds a temporary redirect watcher that will either redirect or destroy itself after the flags are ready.

```javascript
import { ldRedirectMixin } from 'vue-ld';

export default {
  // ...
  mixins: [ldRedirectMixin('yourFlag', { name: 'home' })],
  // ...
};
```

#### Arguments

| key            | description                                                                                    | type                              |
| :------------- | ---------------------------------------------------------------------------------------------- | --------------------------------- |
| `requiredFlag` | If the given feature flag is false, the user will be redirected to the given route.            | `string`                          |
| `to`           | The path which vue router will push. Functions passed are expected to resolve to a valid path. | `string`, `object`, or `function` |
| `invertFlag`   | If set to true the the inverse of the requiredFlag's value will be used.                       | `boolean`                         |

### LDRouteGuard Component

Use this as an intermediary component on a route you need to guard with a feature flag; it is based on the `ldRedirectMixin`. All props are passed to the component rendered.

```javascript
import { LDRouteGuard } from 'vue-ld';
import SecretComponent from '@/components/Secret';

const route = {
  path: '/secret',
  component: LDRouteGuard,
  props: {
    component: SecretComponent,
    requiredFeatureFlag: 'palantir',
    to: { name: 'away' },
  },
};
```

#### Props

| key            | description                                                                                    | type                              |
| :------------- | ---------------------------------------------------------------------------------------------- | --------------------------------- |
| `component`    | The component to be rendered given the required feature flag is true.                          | `vue component`                   |
| `requiredFlag` | If the given feature flag is false, the user will be redirected to the given route.            | `string`                          |
| `to`           | The path which vue router will push. Functions passed are expected to resolve to a valid path. | `string`, `object`, or `function` |
| `invertFlag`   | If set to true the the inverse of the requiredFlag's value will be used.                       | `boolean`                         |

## Development

After cloning the repo to your machine:

```bash
$ npm install
$ npm run watch
```

### Local

If you wish to test out your changes in another project locally, you can install with `npm install --save <your_local_path_to_/vue-ld>`. Your vue app will detect changes so long as vue-ld is being watched (by running `npm run watch`).
