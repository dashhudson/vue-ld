import * as LDClient from 'launchdarkly-js-client-sdk';
import { formatFlags } from './utils';

export default {
  install(Vue, options) {
    const { clientSideId, user, options: ldOptions, readyBeforeIdentify = true } = options;

    const ldClient = LDClient.initialize(clientSideId, user, ldOptions);

    const $ld = Vue.observable({
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
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$ld = $ld;
  },
};
