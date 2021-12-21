import sinon from 'sinon';
import VueLd from '@/plugin';
import { rethrow } from '@/utils';
import { mount, ldClientReady } from './utils';
import { defaultVueLdOptions, flagsResponse } from './dummy';

const Component = {
  template: '<div></div>',
};

jest.mock('@/utils', () => {
  return {
    ...jest.requireActual('@/utils'),
    rethrow: jest.fn(),
  };
});

describe('VueLd Plugin', () => {
  let errorSpy;
  let server;
  let warnSpy;

  const createComponent = async (vueLdOptions = {}) => {
    const VueLdPlugin = [
      VueLd,
      {
        ...defaultVueLdOptions,
        ...vueLdOptions,
      },
    ];
    return mount(Component, { plugins: [VueLdPlugin] });
  };

  beforeEach(() => {
    server = sinon.createFakeServer();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    server.restore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe('Success states', () => {
    beforeEach(() => {
      server.autoRespond = true;
      server.autoRespondAfter = 0;
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(flagsResponse),
      ]);
    });
    it('changes ready state before identify', async () => {
      const wrapper = await createComponent();

      expect(wrapper.vm.$ld).not.toBe(undefined);
      expect(wrapper.vm.$ld.ready).toBeFalsy();

      await ldClientReady(wrapper);

      expect(wrapper.vm.$ld.ready).toBeTruthy();
    });

    it('changes ready state after identify', async () => {
      const wrapper = await createComponent({ readyBeforeIdentify: false });

      expect(wrapper.vm.$ld).not.toBe(undefined);
      expect(wrapper.vm.$ld.ready).toBeFalsy();

      await ldClientReady(wrapper);
      expect(wrapper.vm.$ld.ready).toBeFalsy();
      await wrapper.vm.$ld.identify({
        newUser: {
          key: 'anonymous2',
          email: 'anonymous2@test.com',
          name: 'Anonymous User 2',
        },
      });
      expect(wrapper.vm.$ld.ready).toBeTruthy();
    });

    it('calls vueLdCallback after ready with correct context', async () => {
      const wrapper = await createComponent({ readyBeforeIdentify: false });
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
      const wrapper = await createComponent({
        /*
          Using a proxy like this will allow you to return true for everything
          not explicitly on the base object or set later.
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

      expect(wrapper.vm.$ld.flags.never).toBeFalsy();
      expect(wrapper.vm.$ld.flags.anythingElse).toBeTruthy();

      wrapper.vm.$ld.flags.neverLater = false;
      expect(wrapper.vm.$ld.flags.neverLater).toBeFalsy();

      delete wrapper.vm.$ld.flags.neverLater;
      expect(wrapper.vm.$ld.flags.anythingElse).toBeTruthy();
    });
  });

  describe('Error states', () => {
    beforeEach(() => {
      server.autoRespond = true;
      server.autoRespondAfter = 0;
      server.respondWith([
        400,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ message: 'Bad Request' }),
      ]);
    });

    it('should set error when ldClient emits an error', async () => {
      const wrapper = await createComponent();
      await ldClientReady(wrapper);
      expect(wrapper.vm.$ld.error).toBeTruthy();
      // Should not eat errors
      expect(rethrow).toHaveBeenCalled();
    });
  });
});
