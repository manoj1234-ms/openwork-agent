// Mock inquirer for testing
module.exports = {
  prompt: jest.fn().mockResolvedValue({}),
  registerPrompt: jest.fn(),
  createPromptModule: jest.fn(),
  ui: {
    BottomBar: jest.fn(),
    Prompt: jest.fn()
  },
  Separator: jest.fn(),
  shapes: {
    Arrow: jest.fn(),
    Pointer: jest.fn()
  }
};