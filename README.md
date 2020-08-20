# Vue LaunchDarkly

A simple wrapper around the [js-client-sdk](https://github.com/launchdarkly/js-client-sdk) that provides observable feature flags, a ready state to ensure all feature flags are up to date, and other utilities.

## Usage

### Installation

```bash
$ npm install --save vue-ld
```

Main.js

```javascript
import Vue from 'vue'
import VueLd from 'vue-ld';

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
  <div v-if="$ld.ready">
    // Render after feature flags are ready
  </div>
</template>
```

```html
<template>
  <div v-if="$ld.flags.yourFlag">
    // Render if the feature flag is true
  </div>
</template>
```

### Identify

A wrapper around `ldClient.identify` to allow for

```javascript
const options = {
  newUser: to,
};
const vueLdCallback = () => {
  // ...
};

export default {
  watch: {
    user(to) {
      this.$ld.identify(options, vueLdCallback);
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
import { ldRedirect } from 'vue-ld.mixins';

export default {
  // ...
  mixins: [ldRedirect('yourFlag', { name: 'home' })],
  // ...
};
```

#### Arguments

| key            | description                                                                         | type                 |
| :------------- | ----------------------------------------------------------------------------------- | -------------------- |
| `requiredFlag` | If the given feature flag is false, the user will be redirected to the given route. | `Boolean`            |
| `to`           | The path or object which vue router will push.                                      | `string` or `object` |
