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
      identify(identity, currentBrand) {
        this.ready = false;
        ldClient
          .identify({
            key: identity.id,
            email: identity.email,
            name: `${identity.first_name} ${identity.last_name}`,
            custom: {
              brand: currentBrand.label,
            },
          })
          .then(() => {
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
