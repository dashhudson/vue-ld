import { createClient } from '@launchdarkly/js-client-sdk';
import { reactive } from 'vue';
import { formatFlags, rethrow } from './utils';

export const initialize = ({ clientSideId, context, ldOptions, readyBeforeIdentify, bootstrap }) => {
  const ldClient = createClient(clientSideId, context, ldOptions);

  const $ld = reactive({
    ldClient,
    identify({ newContext, hash, callback }, vueLdCallback) {
      return new Promise((r) => {
        this.ready = false;
        ldClient.identify(newContext, hash !== undefined ? { hash } : undefined).then(() => {
          if (callback) callback();
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

  ldClient.on('change', () => {
    $ld.flags = { ...formatFlags(ldClient.allFlags()) };
  });

  ldClient.on('error', (e) => {
    $ld.error = e;
    rethrow(e);
  });

  // Start AFTER registering event listeners, as the SDK recommends.
  // Pass bootstrap data if provided so the client can initialize without a network request.
  ldClient.start(bootstrap !== undefined ? { bootstrap } : undefined);

  return $ld;
};

const stub = ({ flagsStub, readyBeforeIdentify }) => ({
    identify() {
      this.ready = true;
    },
    flags: flagsStub,
    ready: readyBeforeIdentify,
  });

export default {
  async install(vue, options) {
    const {
      clientSideId,
      context,
      options: ldOptions,
      bootstrap,
      flagsStub,
      readyBeforeIdentify = true,
    } = options;

    let $ld;

    if (flagsStub) {
      $ld = stub({ flagsStub, readyBeforeIdentify });
    } else {
      $ld = initialize({ clientSideId, context, ldOptions, readyBeforeIdentify, bootstrap });
    }

    // eslint-disable-next-line no-param-reassign
    vue.config.globalProperties.$ld = $ld;
  },
};
