export const ldClientReady = (wrapper) =>
  new Promise((r) => {
    wrapper.vm.$ld.ldClient.on('ready', () => {
      r();
    });
  });
