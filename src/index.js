// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <App />
    </div>
  </React.StrictMode>
);

reportWebVitals();
