import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common/Button';
import { FormField, Input } from '../common/FormField';

export function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await authApi.login({ email, password });
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FormField label="Email" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
        />
      </FormField>
      <FormField label="Password" required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </FormField>
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 4 }}>{error}</p>
      )}
      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
        Sign in
      </Button>
      <p style={{ fontSize: 13, textAlign: 'center', marginTop: 12, color: '#6b7280' }}>
        No account? <Link to="/register">Create one</Link>
      </p>
    </form>
  );
}
