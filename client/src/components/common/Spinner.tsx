import React from 'react';

export function Spinner({ size = 32, message }: { size?: number; message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid #e5e7eb`,
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {message && <p style={{ fontSize: 13, color: '#6b7280' }}>{message}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function FullPageSpinner({ message }: { message?: string }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center', background: '#fff',
    }}>
      <Spinner message={message} />
    </div>
  );
}
