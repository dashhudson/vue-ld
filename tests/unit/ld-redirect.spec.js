import ldRedirect from '@/mixins/ldRedirect';
import VueLd from '@/plugin';
import { mount, ldClientReady } from './utils';
import { defaultVueLdOptions, flagsResponse } from './dummy';

const Component = {
  template: '<div></div>',
};

const createMixin = (props) => props
    ? [ldRedirect(props.flag, props.redirect, props.invertFlag)]
    : [ldRedirect('myFlag', '/', false)];

describe('ldRedirectMixin', () => {
  let mocks;

  const createComponent = async (mixins, bootstrapFlags = flagsResponse) => {
    const VueLdPlugin = [VueLd, { ...defaultVueLdOptions, bootstrap: bootstrapFlags }];
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('redirects without feature flag', async () => {
    const wrapper = await createComponent(createMixin(), { myFlag: false });
    expect(wrapper.vm.$ld.flags.myFlag).toBeFalsy();
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });

  it('does not redirect with feature flag & destroys watchers', async () => {
    const wrapper = await createComponent(createMixin());
    expect(wrapper.vm.$ld.flags.myFlag).toBeTruthy();
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    expect(wrapper.vm.ldRedirectReadyWatcher).toBe(null);
    expect(wrapper.vm.ldRedirectFlagWatcher).toBe(null);
  });

  it('correctly handles redirect as object', async () => {
    const redirectObj = { to: 'some.route' };
    const wrapper = await createComponent(
      createMixin({ flag: 'myFlag', redirect: redirectObj, invertFlag: false }),
      { myFlag: false }
    );
    expect(wrapper.vm.$ld.flags.myFlag).toBeFalsy();
    expect(wrapper.vm.$router.push).toBeCalledWith(redirectObj);
  });

  it('correctly handles redirect as function', async () => {
    const redirectObj = { to: 'some.route' };
    const redirectFunc = () => redirectObj;
    const wrapper = await createComponent(
      createMixin({ flag: 'myFlag', redirect: redirectFunc, invertFlag: false }),
      { myFlag: false }
    );
    expect(wrapper.vm.$ld.flags.myFlag).toBeFalsy();
    expect(wrapper.vm.$router.push).toBeCalledWith(redirectObj);
  });

  it('redirects on true featureflag if invertFlag is set', async () => {
    const wrapper = await createComponent(
      createMixin({ flag: 'myFlag', redirect: { to: 'some.route' }, invertFlag: true }),
      { myFlag: true }
    );
    expect(wrapper.vm.$ld.flags.myFlag).toBeTruthy();
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });
});
