# Vue LaunchDarkly

[![codecov](https://img.shields.io/codecov/c/github/dashhudson/vue-ld/dev?color=%23d6b034)](https://codecov.io/gh/dashhudson/vue-ld) [![npm version](https://img.shields.io/npm/v/vue-ld?color=%23d6b034)](https://www.npmjs.com/package/vue-ld) [![Last Commit](https://img.shields.io/github/last-commit/dashhudson/vue-ld?color=%23d6b034)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
[![Licence](https://img.shields.io/github/license/dashhudson/vue-ld?color=%23d6b034)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)

A simple wrapper around the [js-client-sdk](https://github.com/launchdarkly/js-client-sdk) that provides observable feature flags, a ready state to ensure all feature flags are up to date, and other utilities.

## Usage

### Installation

```bash
$ npm install --save vue-ld
```

Main.js

```javascript
import Vue from 'vue'
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
  }
```

#### Additional Plugin Options

| key                   | description                                                                        | default | type      |
| :-------------------- | ---------------------------------------------------------------------------------- | ------- | --------- |
| `readyBeforeIdentify` | If set to false, the `$ld.ready` will only be true after identify has been called. | `true`  | `Boolean` |

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

| key            | description                                                                         | type                 |
| :------------- | ----------------------------------------------------------------------------------- | -------------------- |
| `requiredFlag` | If the given feature flag is false, the user will be redirected to the given route. | `string`             |
| `to`           | The path or object which vue router will push.                                      | `string` or `object` |

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

| key            | description                                                                         | type                 |
| :------------- | ----------------------------------------------------------------------------------- | -------------------- |
| `component`    | The component to be rendered given the required feature flag is true.               | `vue component`      |
| `requiredFlag` | If the given feature flag is false, the user will be redirected to the given route. | `string`             |
| `to`           | The path or object which vue router will push.                                      | `string` or `object` |
