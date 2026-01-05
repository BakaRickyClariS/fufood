import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import './styles/index.css';
import App from '@/App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { FCMProvider } from '@/shared/providers/FCMProvider';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FCMProvider autoRequest>
          <App />
        </FCMProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
