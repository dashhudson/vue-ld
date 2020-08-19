export const ldClientReady = (wrapper) => {
  return new Promise((r) => {
    wrapper.vm.$ld.ldClient.on('ready', () => {
      r();
    });
  });
};
