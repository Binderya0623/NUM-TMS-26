import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// module-auth — bootstrap файл
// index.ts-ийн import('./bootstrap') динамик дуудлагаар ачааллагдана
// Webpack-ийн code-splitting: аппын эхний ачааллыг хөнгөвчилнэ

const container = document.getElementById('auth-root');

if (container) {
  container.innerHTML = ''; // loading fallback-г устгана
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('[module-auth] #auth-root элемент олдсонгүй');
}
