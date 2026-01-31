// Jest setup file
require('dotenv').config();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // uncomment to ignore specific console.log calls
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);