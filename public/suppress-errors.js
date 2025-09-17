// Suppress browser extension errors in production
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    // Suppress publicPath errors from browser extensions
    if (args[0] && typeof args[0] === 'string' && args[0].includes('publicPath')) {
      return;
    }
    if (args[0] && typeof args[0] === 'object' && args[0].message && args[0].message.includes('publicPath')) {
      return;
    }
    originalError.apply(console, args);
  };

  // Also handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('publicPath')) {
      event.preventDefault();
    }
  });
}