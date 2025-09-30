// src/App.test.js
jest.mock('./firebase', () => ({
  app: {},
  auth: { onAuthStateChanged: jest.fn() },
  db: {},
  storage: {},
  appCheckReady: Promise.resolve(),
}));

test('smoke', () => {
  expect(true).toBe(true);
});
