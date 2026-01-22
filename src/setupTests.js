// src/setupTests.js
import '@testing-library/jest-dom';
import 'whatwg-fetch';

import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// --- Streams për undici/Firebase (me fallback sipas versionit të paketës) ---
(() => {
  try {
    // Shkalla 1: path i ri (v3)
    const { ReadableStream, WritableStream } =
      require('web-streams-polyfill/ponyfill/es2018');
    global.ReadableStream = ReadableStream;
    global.WritableStream = WritableStream;
  } catch (e1) {
    try {
      // Shkalla 2: path i përgjithshëm (v2/v3)
      const { ReadableStream, WritableStream } =
        require('web-streams-polyfill/ponyfill');
      global.ReadableStream = ReadableStream;
      global.WritableStream = WritableStream;
    } catch (e2) {
      // nëse edhe kjo mungon, thjesht mos i sete – shumicën e testeve nuk do i duhen
      // console.warn('[tests] streams polyfill not loaded', e2);
    }
  }
})();
