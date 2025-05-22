// This file suppresses React Helmet warnings about UNSAFE_componentWillMount
// Import this file once in App.tsx to silence the warnings throughout the application

const originalConsoleError = console.error;

console.error = function filterWarnings(msg, ...args) {
  // Don't log React Helmet warnings about UNSAFE_componentWillMount
  if (
    typeof msg === 'string' && 
    (msg.includes('UNSAFE_componentWillMount') || 
     msg.includes('SideEffect(NullComponent'))
  ) {
    return;
  }
  return originalConsoleError(msg, ...args);
};

export default { init: () => {} };