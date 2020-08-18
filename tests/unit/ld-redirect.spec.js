import sinon from 'sinon';
import { cloneDeep } from 'lodash';
import { createLocalVue, mount } from '@vue/test-utils';
import { ldClientReady } from './utils';
import { vueLdOptions, flagsResponse } from './dummy';
import ldRedirect from '@/mixins/ldRedirect';

import VueLd from '@/plugin';

const Component = {
  template: '<div></div>',
};

let errorSpy;
let localVue;
let mixins;
let mocks;
let server;
let warnSpy;
let wrapper;

describe('VueLd', () => {
  beforeEach(() => {
    server = sinon.createFakeServer();
    server.autoRespond = true;
    server.autoRespondAfter = 0;
  });

  afterEach(() => {
    server.restore();
  });

  const finishSetup = async () => {
    localVue = createLocalVue();
    localVue.use(VueLd, vueLdOptions);
    mixins = [ldRedirect('myFlag', '/')];
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

  it('redirects without feature flag', async () => {
    const flags = cloneDeep(flagsResponse);
    flags.myFlag.value = false;
    server.respondWith([200, { 'Content-Type': 'application/json' }, JSON.stringify(flags)]);
    await finishSetup();
    expect(wrapper.vm.$ld.flags.myFlag).toBe(false);
    expect(wrapper.vm.$router.push).toHaveBeenCalled();
  });

  it('does not redirects with feature flag', async () => {
    server.respondWith([
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(flagsResponse),
    ]);
    await finishSetup();
    expect(wrapper.vm.$ld.flags.myFlag).toBe(true);
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
  });
});
