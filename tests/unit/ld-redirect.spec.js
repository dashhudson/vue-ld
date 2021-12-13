import sinon from 'sinon';
import { cloneDeep } from 'lodash';
import ldRedirect from '@/mixins/ldRedirect';
import VueLd from '@/plugin';
import { mount, ldClientReady } from './utils';
import { defaultVueLdOptions, flagsResponse } from './dummy';

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
  let mocks;

  const createComponent = async (mixins) => {
    const VueLdPlugin = [VueLd, defaultVueLdOptions];
    mocks = {
      $router: { push: jest.fn() },
    };
    const wrapper = await mount(Component, {
      plugins: [VueLdPlugin],
      mixins,
      mocks,
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

  it('redirects wiout feature flag', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    const wrapper = await createComponent(createMixin());
    expect(wrapper.vm.$ld.flags.myFlag).toBeFalsy();
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });

  it('does not redirect with feature flag & destroys watchers', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    const wrapper = await createComponent(createMixin());
    expect(wrapper.vm.$ld.flags.myFlag).toBeTruthy();
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.vm.ldRedirectReadyWatcher).toBe(null);
    expect(wrapper.vm.ldRedirectFlagWatcher).toBe(null);
  });

  it('correctly handles redirect as object', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    const redirectObj = { to: 'some.route' };
    const wrapper = await createComponent(
      createMixin({ flag: 'myFlag', redirect: redirectObj, invertFlag: false })
    );
    expect(wrapper.vm.$ld.flags.myFlag).toBeFalsy();
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
    const wrapper = await createComponent(
      createMixin({ flag: 'myFlag', redirect: redirectFunc, invertFlag: false })
    );
    expect(wrapper.vm.$ld.flags.myFlag).toBeFalsy();
    expect(wrapper.vm.$router.push).toBeCalledWith(redirectObj);
  });

  it('redirects on true featureflag if invertFlag is set', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = true;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    const wrapper = await createComponent(
      createMixin({ flag: 'myFlag', redirect: { to: 'some.route' }, invertFlag: true })
    );
    expect(wrapper.vm.$ld.flags.myFlag).toBeTruthy();
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });
});
