// src/setupTests.js
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// TextEncoder/TextDecoder për Jest
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ✅ Streams për undici/Firebase (PATH I SAKTË)
import { ReadableStream, WritableStream } from 'web-streams-polyfill/ponyfill/es2018';
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;

