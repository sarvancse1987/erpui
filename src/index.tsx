import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PrimeReactProvider } from 'primereact/api';
import AppProviders from './layout/AppProviders';

import "primereact/resources/themes/lara-light-blue/theme.css"; // THEME (must be first)
import "primereact/resources/primereact.min.css";               // Core styles
import "primeicons/primeicons.css";                             // Icons
import "primeflex/primeflex.css";                               // Utility classes
import "./asset/styles/layout/layout.scss";                     // Your overrides
import "./index.css";                                           // Your global CSS


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <PrimeReactProvider value={{ unstyled: false, ripple: true }}>
    <AppProviders>
      <App />
    </AppProviders>
  </PrimeReactProvider>
);
reportWebVitals();
