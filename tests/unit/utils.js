import { isVue2 } from 'vue-demi';

export const mount = async (component, { plugins, mixins, mocks, props }) => {
  let wrapper;
  if (isVue2) {
    const { createLocalVue, mount: vue2Mount } = await import('@vue/test-utils');
    const localVue = createLocalVue();
    plugins.forEach((plugin) => {
      localVue.use(...plugin);
    });
    wrapper = vue2Mount(component, {
      localVue,
      mixins,
      mocks,
      propsData: props,
    });
  } else {
    const { mount: vue3Mount } = await import('@vue/test-utils');
    wrapper = vue3Mount(component, {
      global: { plugins, mixins, mocks },
      props,
    });
  }
  return wrapper;
};

export const ldClientReady = (wrapper) => new Promise((r) => {
    wrapper.vm.$ld.ldClient.on('ready', () => {
      r();
    });
  });
