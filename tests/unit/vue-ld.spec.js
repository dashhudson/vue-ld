import sinon from 'sinon';
import { createLocalVue, mount } from '@vue/test-utils';
import { ldClientReady } from './utils';
import { vueLdOptions } from './dummy';

import VueLd from '@/plugin';

const Component = {
  template: '<div></div>',
};

let errorSpy;
let localVue;
let server;
let warnSpy;
let wrapper;

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
});
