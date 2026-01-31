// Mock ora for testing
module.exports = jest.fn(() => ({
  start: jest.fn(() => ({
    succeed: jest.fn(),
    fail: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    stop: jest.fn(),
    stopAndPersist: jest.fn()
  })),
  succeed: jest.fn(),
  fail: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  stop: jest.fn(),
  stopAndPersist: jest.fn()
}));