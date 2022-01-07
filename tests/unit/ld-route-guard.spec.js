import sinon from 'sinon';
import { cloneDeep } from 'lodash';
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
  let server;
  let mocks;

  const createComponent = async (component, componentProps = {}, invertFlag = false) => {
    const VueLdPlugin = [VueLd, defaultVueLdOptions];
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

  beforeEach(() => {
    server = sinon.createFakeServer();
    server.autoRespond = true;
    server.autoRespondAfter = 0;
  });

  afterEach(() => {
    server.restore();
  });

  it('redirects without feature flag & does not contain component', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    const wrapper = await createComponent(EmptyComponent);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBeFalsy();
  });

  it('redirects without feature flag with dynamically imported component', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);

    const dynamicEmptyComponent = new Promise((resolve) => resolve(EmptyComponent));
    const wrapper = await createComponent(dynamicEmptyComponent);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });

  it('does not redirect with feature flag & contains component', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    const wrapper = await createComponent(EmptyComponent);
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBeTruthy();
    expect(wrapper.findComponent(EmptyComponent).text()).toBe('title');
  });

  it('does not redirect with feature flag & contains component with props', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    const wrapper = await createComponent(EmptyComponent, { title: 'a different title' });
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBeTruthy();
    expect(wrapper.findComponent(EmptyComponent).text()).toBe('a different title');
  });

  it('redirects with featureflag if invertFlag is set', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    const wrapper = await createComponent(EmptyComponent, {}, true);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBeFalsy();
  });
});
