export const mount = async (component, { plugins, mixins, mocks, props }) => {
  const { mount: vue3Mount } = await import('@vue/test-utils');
  const wrapper = vue3Mount(component, {
    global: { plugins, mixins, mocks },
    props,
  });
  return wrapper;
};

export const ldClientReady = (wrapper) => new Promise((r) => {
    wrapper.vm.$ld.ldClient.on('ready', () => {
      r();
    });
  });
