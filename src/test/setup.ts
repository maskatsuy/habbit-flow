import '@testing-library/jest-dom'

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}