import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import AppContainer from '@/shared/components/layout/AppContainer';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>,
);
