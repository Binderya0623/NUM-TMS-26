import { createHashRouter, Navigate } from 'react-router';
import LoginPage from '@/pages/LoginPage';

/**
 * module-auth Router
 *
 * JSF хост дотор ажиллах үед base нь '/login.xhtml' байна.
 * Standalone dev үед '/' байна.
 *
 * Нэвтрэлт шаардах хамгаалалт энд байхгүй — нэвтрэлтийн дараа
 * AuthContext-ийн login() функц JSF хуудас руу шууд redirect хийнэ.
 */
export const router = createHashRouter(
  [
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '*',
      element: <Navigate to="/login" replace />,
    },
  ],
  {
    // JSF standalone dev үед basename шаардлагагүй
    // JSF хост дотор ажиллахад hash router ашиглах нь илүү аюулгүй
  }
);
