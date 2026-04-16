import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f9fafb', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '32px 36px', width: '100%', maxWidth: 400,
      }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>GPKarta</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
