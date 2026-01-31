// Mock chalk for testing
module.exports = {
  red: jest.fn(str => str),
  green: jest.fn(str => str),
  yellow: jest.fn(str => str),
  blue: jest.fn(str => str),
  magenta: jest.fn(str => str),
  cyan: jest.fn(str => str),
  white: jest.fn(str => str),
  gray: jest.fn(str => str),
  bold: jest.fn(str => str),
  dim: jest.fn(str => str),
  italic: jest.fn(str => str),
  underline: jest.fn(str => str),
  inverse: jest.fn(str => str),
  hidden: jest.fn(str => str),
  strikethrough: jest.fn(str => str),
  reset: jest.fn(str => str),
  keyword: jest.fn(() => ({ bold: jest.fn(str => str) })),
  hex: jest.fn(() => ({ bold: jest.fn(str => str) }))
};