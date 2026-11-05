import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ style: { background: '#171717', color: '#fff', border: '1px solid #C9A45C55', borderRadius: 0 } }} />
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
