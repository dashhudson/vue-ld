# Vue Launch Darkly

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

| key                   | description                                                                       | default     | options    |
| :-------------------- | --------------------------------------------------------------------------------- | ----------- | ---------- |
| `readyBeforeIdentify` | If set to false, the \$ld.ready will only be true after identify has been called. | `true`      | `Boolean`  |
| `onIdentify`          | A method called after the identify promise resolves; bound to the \$ld context.   | `undefined` | `function` |

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

### Redirect Mixin

Adds a temporary redirect watcher that will either redirect or destroy itself after the flags are ready.

```javascript
import { ldRedirect } from 'vue-ld';

export default {
  // ...
  mixins: [ldRedirect('yourFlag', { name: 'home' })],
  // ...
};
```

#### Arguments

| key            | description                                                                         | options              |
| :------------- | ----------------------------------------------------------------------------------- | -------------------- |
| `requiredFlag` | If the given feature flag is false, the user will be redirected to the given route. | `Boolean`            |
| `route`        | The path or object to be passed to vue router.                                      | `string` or `object` |
