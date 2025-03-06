import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppContext, { AppProvider } from './context/AppContext';
import { SnackbarProvider } from 'notistack';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppProvider>
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    </AppProvider>
  </React.StrictMode>
);