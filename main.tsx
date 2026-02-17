
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("عذراً، لم يتم العثور على عنصر الجذر (root) في ملف HTML.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
