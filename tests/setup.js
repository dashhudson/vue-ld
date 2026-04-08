// Polyfill TextEncoder/TextDecoder — jsdom v20 doesn't expose these on the window,
// but the LD SDK v4 uses them to encode context keys for URL parameters.
const { TextEncoder, TextDecoder } = require('util');

const { webcrypto } = require('crypto');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill crypto.subtle — the LD SDK v4 uses Web Crypto for hashing context keys.
// jsdom v20 exposes window.crypto as a getter-only property without subtle support,
// so we need Object.defineProperty to override it.
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
  configurable: true,
  writable: true,
});

// Stub out EventSource — jsdom's EventSource tries to make real HTTP connections.
// The LD SDK uses EventSource for streaming; providing a stub prevents real network
// requests while allowing the SDK to proceed with bootstrap-provided flag values.
global.EventSource = class EventSource {
  constructor() {
    this.close = () => {};
  }

  // eslint-disable-next-line class-methods-use-this
  addEventListener() {}

  // eslint-disable-next-line class-methods-use-this
  removeEventListener() {}
};
