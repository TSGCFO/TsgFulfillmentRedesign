// This file is used to suppress React console warnings related to deprecated lifecycle methods
// Specifically targeting the warning from React Helmet about UNSAFE_componentWillMount

const originalConsoleError = console.error;

console.error = function filterWarnings(msg, ...args) {
  // Don't log React Helmet warnings about UNSAFE_componentWillMount
  if (typeof msg === 'string' && msg.includes('UNSAFE_componentWillMount')) {
    return;
  }
  return originalConsoleError(msg, ...args);
};

export default {};