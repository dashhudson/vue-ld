import { isVue2 } from 'vue-demi';

export const mount = async (component, { plugins, mixins, mocks, props }) => {
  let wrapper;
  if (isVue2) {
    // eslint-disable-next-line no-shadow
    const { createLocalVue, mount } = await import('@vue/test-utils');
    const localVue = createLocalVue();
    plugins.forEach((plugin) => {
      localVue.use(...plugin);
    });
    wrapper = mount(component, {
      localVue,
      mixins,
      mocks,
      propsData: props,
    });
  } else {
    // eslint-disable-next-line no-shadow
    const { mount } = await import('@vue/test-utils');
    wrapper = mount(component, {
      global: { plugins, mixins, mocks },
      props,
    });
  }
  return wrapper;
};

export const ldClientReady = (wrapper) => {
  return new Promise((r) => {
    wrapper.vm.$ld.ldClient.on('ready', () => {
      r();
    });
  });
};
