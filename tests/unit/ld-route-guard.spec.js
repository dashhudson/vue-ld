import sinon from 'sinon';
import { cloneDeep } from 'lodash';
import { createLocalVue, mount } from '@vue/test-utils';
import RouterGuard from '@/components/LDRouteGuard.vue';
import ldRedirect from '@/mixins/ldRedirect';
import VueLd from '@/plugin';
import { ldClientReady } from './utils';
import { vueLdOptions, flagsResponse } from './dummy';

const mixins = [ldRedirect('myFlag', '/')];

const EmptyComponent = {
  name: 'empty-component',
  render(h) {
    return h('div');
  },
};

describe('ldRedirectMixin', () => {
  let server;
  beforeEach(() => {
    server = sinon.createFakeServer();
    server.autoRespond = true;
    server.autoRespondAfter = 0;
  });

  let localVue;
  let mocks;
  let wrapper;
  const finishSetup = async (component, invertFlag) => {
    localVue = createLocalVue();
    localVue.use(VueLd, vueLdOptions);
    mocks = {
      $router: { push: jest.fn() },
    };
    wrapper = mount(RouterGuard, {
      localVue,
      mixins,
      mocks,
      propsData: {
        component,
        requiredFeatureFlag: 'myFlag',
        to: '/',
        invertFlag,
      },
    });
    await ldClientReady(wrapper);
  };

  afterEach(() => {
    server.restore();
  });

  it('redirects without feature flag & does not contain component', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    await finishSetup(EmptyComponent, false);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBe(false);
  });

  it('redirects without feature flag with dynamically imported component', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);

    const dynamicEmptyComponent = new Promise((resolve) => resolve(EmptyComponent));
    await finishSetup(dynamicEmptyComponent, false);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });

  it('does not redirect with feature flag & contains component', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    await finishSetup(EmptyComponent, false);
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBe(true);
  });

  it('redirects with featureflag if invertFlag is set', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    await finishSetup(EmptyComponent, true);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBe(false);
  });
});
