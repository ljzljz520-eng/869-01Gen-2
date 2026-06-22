import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  REDIRECT_ROUTES,
  ADMIN_ROUTES,
  AUDIT_ROUTES,
  FALLBACK_ROUTES,
} from '@/routes';

const App: React.FC = () => {
  return (
    <Routes>
      {PUBLIC_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {AUTH_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {REDIRECT_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {ADMIN_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {AUDIT_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {FALLBACK_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default App;
