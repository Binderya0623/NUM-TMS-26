import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router/routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
