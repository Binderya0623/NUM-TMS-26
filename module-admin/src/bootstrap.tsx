/**
 * bootstrap.tsx — Admin микрофронтэнд эхлүүлэх файл
 *
 * index.ts-ийн dynamic import-аар ачаалагдана.
 * НЭВТРЭЛТ + ДҮР ШАЛГАХ: localStorage-аас хэрэглэгчийг уншиж,
 * нэвтрээгүй бол login.xhtml, буруу дүр бол teacher/student.xhtml руу шилжинэ.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { guardRoute } from './lib/authGuard';

const container = document.getElementById('microfrontend-root');

if (container) {
  // Нэвтрэлт болон дүрийг шалгана — шалгаагүй бол redirect хийгэнд зогсоно
  const user = guardRoute('admin');

  if (user) {
    // Нэвтрэлт баталгаажсан → React рэндэр эхлэнэ
    container.innerHTML = '';
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App user={user} />
      </React.StrictMode>
    );
  }
  // user null бол guardRoute аль хэдийн redirect хийсэн тул юу ч хийхгүй
} else {
  console.error('[module-admin] #microfrontend-root элемент олдсонгүй');
}
