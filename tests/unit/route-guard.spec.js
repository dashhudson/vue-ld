import sinon from 'sinon';
import { cloneDeep } from 'lodash';
import { createLocalVue, mount } from '@vue/test-utils';
import RouterGuard from '@/components/RouteGuard.vue';
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
  const finishSetup = async () => {
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
        component: EmptyComponent,
        requiredFeatureFlag: 'myFlag',
        to: '/',
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
    await finishSetup();
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBe(false);
  });

  it('does not redirect with feature flag & contains component', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    await finishSetup();
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.findComponent(EmptyComponent).exists()).toBe(true);
  });
});
