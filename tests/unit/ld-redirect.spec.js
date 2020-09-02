import sinon from 'sinon';
import { cloneDeep } from 'lodash';
import { createLocalVue, mount } from '@vue/test-utils';
import ldRedirect from '@/mixins/ldRedirect';
import VueLd from '@/plugin';
import { ldClientReady } from './utils';
import { vueLdOptions, flagsResponse } from './dummy';

const Component = {
  template: '<div></div>',
};

const mixins = [ldRedirect('myFlag', '/')];

describe('ldRedirect Mixin', () => {
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
    wrapper = mount(Component, {
      localVue,
      mixins,
      mocks,
    });
    await ldClientReady(wrapper);
  };

  afterEach(() => {
    server.restore();
  });

  it('redirects without feature flag', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    await finishSetup();
    expect(wrapper.vm.$ld.flags.myFlag).toBe(false);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });

  it('does not redirects with feature flag & destroys watcher', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    await finishSetup();
    expect(wrapper.vm.$ld.flags.myFlag).toBe(true);
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.vm.ldRedirectWatcher.name).toStrictEqual('unwatchFn');
  });
});
