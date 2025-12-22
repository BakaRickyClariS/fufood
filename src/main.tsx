import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import './styles/index.css';
import App from '@/App';
import { ToastProvider } from '@/shared/contexts/ToastContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
