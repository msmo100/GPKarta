import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common/Button';

interface NavbarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function Navbar({ title, actions }: NavbarProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <nav style={{
      height: 56, background: '#fff', borderBottom: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', padding: '0 16px',
      position: 'relative', zIndex: 100, flexShrink: 0,
      gap: 12,
    }}>
      <Link to="/dashboard" style={{ fontWeight: 700, fontSize: 16, color: '#111827', textDecoration: 'none', letterSpacing: '-0.5px' }}>
        GPKarta
      </Link>

      {title && (
        <>
          <span style={{ color: '#d1d5db', fontSize: 18 }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
            {title}
          </span>
        </>
      )}

      <div style={{ flex: 1 }} />

      {actions}

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{user.username}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
        </div>
      )}
    </nav>
  );
}
