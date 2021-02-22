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

const createMixin = (props) => {
  return props
    ? [ldRedirect(props.flag, props.redirect, props.invertFlag)]
    : [ldRedirect('myFlag', '/', false)];
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
  const finishSetup = async (mixins) => {
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
    await finishSetup(createMixin());
    expect(wrapper.vm.$ld.flags.myFlag).toBe(false);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });

  it('does not redirect with feature flag & destroys watchers', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    await finishSetup(createMixin());
    expect(wrapper.vm.$ld.flags.myFlag).toBe(true);
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.vm.ldRedirectReadyWatcher).toBe(null);
    expect(wrapper.vm.ldRedirectFlagWatcher).toBe(null);
  });

  it('correctly handles redirect as object', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    const redirectObj = { to: 'some.route' };
    await finishSetup(createMixin({ flag: 'myFlag', redirect: redirectObj, invertFlag: false }));
    expect(wrapper.vm.$ld.flags.myFlag).toBe(false);
    expect(wrapper.vm.$router.push).toBeCalledWith(redirectObj);
  });

  it('correctly handles redirect as function', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    const redirectObj = { to: 'some.route' };
    const redirectFunc = () => {
      return redirectObj;
    };
    await finishSetup(createMixin({ flag: 'myFlag', redirect: redirectFunc, invertFlag: false }));
    expect(wrapper.vm.$ld.flags.myFlag).toBe(false);
    expect(wrapper.vm.$router.push).toBeCalledWith(redirectObj);
  });

  it('redirects on true featureflag if invertFlag is set', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = true;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    await finishSetup(
      createMixin({ flag: 'myFlag', redirect: { to: 'some.route' }, invertFlag: true })
    );
    expect(wrapper.vm.$ld.flags.myFlag).toBe(true);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });
});
