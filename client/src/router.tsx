import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { MapEditorPage } from './pages/MapEditorPage';
import { EmbedPage } from './pages/EmbedPage';
import { PublicMapPage } from './pages/PublicMapPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map/:mapId" element={<MapEditorPage />} />
        <Route path="/embed/:embedToken" element={<EmbedPage />} />
        <Route path="/map/public/:mapId" element={<PublicMapPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
