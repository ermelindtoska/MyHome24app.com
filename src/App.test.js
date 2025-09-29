// src/App.test.js
jest.mock('./firebase', () => ({
  app: {},
  auth: { onAuthStateChanged: jest.fn() },
  db: {},
  storage: {},
  appCheckReady: Promise.resolve(), // që të mos presë AppCheck
}));

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import App from './App';


test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
