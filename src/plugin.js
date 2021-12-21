import * as LDClient from 'launchdarkly-js-client-sdk';
import { isVue2, reactive } from 'vue-demi';
import { formatFlags, rethrow } from './utils';

export const initialize = ({ clientSideId, user, ldOptions, readyBeforeIdentify }) => {
  const ldClient = LDClient.initialize(clientSideId, user, ldOptions);
  const $ld = reactive({
    ldClient,
    identify({ newUser, hash, callback }, vueLdCallback) {
      return new Promise((r) => {
        this.ready = false;
        ldClient.identify(newUser, hash, callback).then(() => {
          this.ready = true;
          if (vueLdCallback) {
            const boundVueLdCallback = vueLdCallback.bind($ld);
            boundVueLdCallback();
          }
          r();
        });
      });
    },
    flags: {},
    ready: false,
    error: null,
  });

  ldClient.on('ready', () => {
    $ld.flags = formatFlags(ldClient.allFlags());
    $ld.ready = readyBeforeIdentify;
  });

  ldClient.on('change', (changes) => {
    const flattenedFlags = Object.fromEntries(
      Object.keys(changes).map((key) => [key, changes[key].current])
    );
    $ld.flags = {
      ...$ld.flags,
      ...formatFlags(flattenedFlags),
    };
  });

  ldClient.on('error', (e) => {
    $ld.error = e;
    rethrow(e);
  });

  return $ld;
};

const stub = ({ flagsStub, readyBeforeIdentify }) => {
  return {
    identify() {
      this.ready = true;
    },
    flags: flagsStub,
    ready: readyBeforeIdentify,
  };
};

export default {
  async install(vue, options) {
    const {
      clientSideId,
      user,
      options: ldOptions,
      flagsStub,
      readyBeforeIdentify = true,
    } = options;

    let $ld;

    if (flagsStub) {
      $ld = stub({ flagsStub, readyBeforeIdentify });
    } else {
      $ld = initialize({ clientSideId, user, ldOptions, readyBeforeIdentify });
    }

    if (isVue2) {
      // eslint-disable-next-line no-param-reassign
      vue.prototype.$ld = $ld;
    } else {
      // eslint-disable-next-line no-param-reassign
      vue.config.globalProperties.$ld = $ld;
      // vue.provide('$ld', $ld);
    }
  },
};
