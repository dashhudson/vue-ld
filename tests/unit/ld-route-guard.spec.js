import { isVue3, h, markRaw } from 'vue-demi';
import RouterGuard from '@/components/LDRouteGuard';
import ldRedirect from '@/mixins/ldRedirect';
import VueLd from '@/plugin';
import { mount, ldClientReady } from './utils';
import { defaultVueLdOptions, flagsResponse } from './dummy';

const mixins = [ldRedirect('myFlag', '/')];

const EmptyComponent = markRaw({
  name: 'empty-component',
  props: {
    title: { type: String, required: false, default: 'title' },
  },
  render(createElement) {
    if (isVue3) {
      return h('div', this.title);
    }
    return createElement('div', this.title);
  },
});

describe('LDRouteGuard', () => {
  let mocks;

  const createComponent = async (component, componentProps = {}, invertFlag = false, bootstrapFlags = flagsResponse) => {
    const VueLdPlugin = [VueLd, { ...defaultVueLdOptions, bootstrap: bootstrapFlags }];
    mocks = {
      $router: { push: jest.fn() },
    };
    const wrapper = await mount(RouterGuard, {
      plugins: [VueLdPlugin],
      mixins,
      mocks,
      props: {
        component,
        componentProps,
        requiredFeatureFlag: 'myFlag',
        to: '/',
        invertFlag,
      },
    });
    await ldClientReady(wrapper);
    return wrapper;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('redirects without feature flag & does not contain component', async () => {
    const wrapper = await createComponent(EmptyComponent, {}, false, { myFlag: false });
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBeFalsy();
  });

  it('redirects without feature flag with dynamically imported component', async () => {
    const dynamicEmptyComponent = new Promise((resolve) => {
      resolve(EmptyComponent)
    });
    const wrapper = await createComponent(dynamicEmptyComponent, {}, false, { myFlag: false });
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });

  it('does not redirect with feature flag & contains component', async () => {
    const wrapper = await createComponent(EmptyComponent);
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBeTruthy();
    expect(wrapper.findComponent(EmptyComponent).text()).toBe('title');
  });

  it('does not redirect with feature flag & contains component with props', async () => {
    const wrapper = await createComponent(EmptyComponent, { title: 'a different title' });
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBeTruthy();
    expect(wrapper.findComponent(EmptyComponent).text()).toBe('a different title');
  });

  it('redirects with featureflag if invertFlag is set', async () => {
    const wrapper = await createComponent(EmptyComponent, {}, true);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBeFalsy();
  });
});
