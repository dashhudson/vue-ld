import * as LDClient from 'launchdarkly-js-client-sdk';
import { formatFlags } from './utils';

export default {
  install(Vue, options) {
    const {
      clientSideId,
      user,
      options: ldOptions,
      onIdentify,
      readyBeforeIdentify = true,
    } = options;

    const ldClient = LDClient.initialize(clientSideId, user, ldOptions);

    const $ld = Vue.observable({
      ldClient,
      identify(newUser, hash, callback) {
        this.ready = false;
        ldClient.identify(newUser, hash, callback).then(() => {
          this.ready = true;
          if (onIdentify) {
            const boundOnIdentify = onIdentify.bind($ld);
            boundOnIdentify();
          }
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

    Vue.prototype.$ld = $ld;
  },
};
