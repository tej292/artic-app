import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Import PrimeReact CSS
import 'primereact/resources/themes/saga-blue/theme.css'; // Or your preferred theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Import base CSS
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
