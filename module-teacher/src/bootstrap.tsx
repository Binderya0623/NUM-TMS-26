/**
 * bootstrap.tsx — Teacher микрофронтэнд эхлүүлэх файл
 * НЭВТРЭЛТ + ДҮР ШАЛГАХ нэмсэн
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { guardRoute } from './lib/authGuard';

const container = document.getElementById('microfrontend-root');

if (container) {
  const user = guardRoute('teacher');

  if (user) {
    container.innerHTML = '';
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App user={user} />
      </React.StrictMode>
    );
  }
} else {
  console.error('[module-teacher] #microfrontend-root элемент олдсонгүй');
}
