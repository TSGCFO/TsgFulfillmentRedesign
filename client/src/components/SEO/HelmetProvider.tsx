import React from 'react';
import { HelmetProvider as ReactHelmetAsyncProvider } from 'react-helmet-async';

// This wraps the application with HelmetProvider from react-helmet-async
// to allow asynchronous SEO metadata management without deprecation warnings
const HelmetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactHelmetAsyncProvider>
      {children}
    </ReactHelmetAsyncProvider>
  );
};

export default HelmetProvider;