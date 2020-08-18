import sinon from 'sinon';
import { createLocalVue, mount } from '@vue/test-utils';

import VueLd from '@/plugin';

const vueLdOptions = {
  clientSideId: 'superSecretToken',
  user: {
    key: 'anonymous',
    email: 'anonymous@test.com',
    name: 'Anonymous User',
  },
};

const Component = {
  template: '<div></div>',
};

let wrapper;
let localVue;
let warnSpy;
let errorSpy;
let server;

describe('VueLd', () => {
  beforeEach(() => {
    localVue = createLocalVue();
    server = sinon.createFakeServer();
    server.autoRespond = true;
    server.autoRespondAfter = 0;
    server.respondWith([200, { 'Content-Type': 'application/json' }, '{}']);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    server.restore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('changes ready state before identify', async () => {
    localVue.use(VueLd, vueLdOptions);
    wrapper = mount(Component, {
      localVue,
    });
    expect(wrapper.vm.$ld).not.toBe(undefined);

    wrapper.vm.$ld.ldClient.on('ready', () => {
      expect(wrapper.vm.$ld.ready).toBe(true);
    });
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

    wrapper.vm.$ld.ldClient.on('ready', () => {
      expect(wrapper.vm.$ld.ready).toBe(false);
    });

    wrapper.vm.$ld.ldClient.on('change', () => {
      expect(wrapper.vm.$ld.ready).toBe(true);
    });
  });
});
