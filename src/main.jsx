import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { DemoProvider } from './store/demoStore.jsx';
import { LangProvider } from './store/langStore.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <DemoProvider>
        <App />
      </DemoProvider>
    </LangProvider>
  </React.StrictMode>
);
