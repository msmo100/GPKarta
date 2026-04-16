import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/auth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapEditorPage } from './pages/MapEditorPage';
import { EmbedPage } from './pages/EmbedPage';
import { FullPageSpinner } from './components/common/Spinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(!user && !!token);

  useEffect(() => {
    if (!checking) return;
    authApi
      .me()
      .then((u) => {
        setAuth(u, token!);
      })
      .catch(() => clearAuth())
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <FullPageSpinner />;
  if (!user && !token) return <Navigate to="/login" replace />;
  if (!user) return <FullPageSpinner />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map/:mapId"
          element={
            <ProtectedRoute>
              <MapEditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/embed/:embedToken" element={<EmbedPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
