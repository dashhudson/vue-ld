import sinon from 'sinon';
import { createLocalVue, mount } from '@vue/test-utils';
import VueLd from '@/plugin';
import { ldClientReady } from './utils';
import { vueLdOptions, flagsResponse } from './dummy';

const Component = {
  template: '<div></div>',
};

describe('VueLd Plugin', () => {
  let errorSpy;
  let localVue;
  let server;
  let warnSpy;
  beforeEach(() => {
    localVue = createLocalVue();
    server = sinon.createFakeServer();
    server.autoRespond = true;
    server.autoRespondAfter = 0;
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    server.restore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  let wrapper;
  it('changes ready state before identify', async () => {
    localVue.use(VueLd, vueLdOptions);
    wrapper = mount(Component, {
      localVue,
    });
    expect(wrapper.vm.$ld).not.toBe(undefined);
    expect(wrapper.vm.$ld.ready).toBe(false);

    await ldClientReady(wrapper);

    expect(wrapper.vm.$ld.ready).toBe(true);
  });

  it('changes ready state after identify', async () => {
    localVue.use(VueLd, {
      ...vueLdOptions,
      readyBeforeIdentify: false,
    });
    wrapper = mount(Component, {
      localVue,
    });

    expect(wrapper.vm.$ld).not.toBe(undefined);
    expect(wrapper.vm.$ld.ready).toBe(false);

    await ldClientReady(wrapper);
    expect(wrapper.vm.$ld.ready).toBe(false);
    await wrapper.vm.$ld.identify({
      newUser: {
        key: 'anonymous2',
        email: 'anonymous2@test.com',
        name: 'Anonymous User 2',
      },
    });
    expect(wrapper.vm.$ld.ready).toBe(true);
  });

  it('calls vueLdCallback after ready with correct context', async () => {
    localVue.use(VueLd, {
      ...vueLdOptions,
      readyBeforeIdentify: false,
    });
    wrapper = mount(Component, {
      localVue,
    });
    const vueLdCallback = jest.fn();
    await ldClientReady(wrapper);
    await wrapper.vm.$ld.identify(
      {
        newUser: {
          key: 'anonymous2',
          email: 'anonymous2@test.com',
          name: 'Anonymous User 2',
        },
      },
      vueLdCallback
    );

    expect(vueLdCallback).toBeCalled();
    expect(vueLdCallback.mock.instances[0]).toBe(wrapper.vm.$ld);
  });

  it('stubs flags when passed the option', async () => {
    localVue.use(VueLd, {
      ...vueLdOptions,
      /*
        Using a proxy like this will allow you to return true for everything
        not explicitly not on the base object or set later.
      */
      flagsStub: new Proxy(
        {
          never: false,
        },
        {
          get(obj, prop) {
            const value = obj[prop];
            return value === undefined ? true : value;
          },
        }
      ),
    });
    wrapper = mount(Component, {
      localVue,
    });

    expect(wrapper.vm.$ld.flags.never).toBe(false);
    expect(wrapper.vm.$ld.flags.anythingElse).toBe(true);

    wrapper.vm.$ld.flags.neverLater = false;
    expect(wrapper.vm.$ld.flags.neverLater).toBe(false);

    delete wrapper.vm.$ld.flags.neverLater;
    expect(wrapper.vm.$ld.flags.anythingElse).toBe(true);
  });
});
