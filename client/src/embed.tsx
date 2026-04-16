import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EmbedPage } from './pages/EmbedPage';

// Embed entry: parse the token from the URL path /embed/:token
const path = window.location.pathname; // e.g. /embed/abc123
const token = path.split('/').pop() ?? '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={[`/embed/${token}`]}>
      <Routes>
        <Route path="/embed/:embedToken" element={<EmbedPage />} />
      </Routes>
    </MemoryRouter>
  </React.StrictMode>,
);
