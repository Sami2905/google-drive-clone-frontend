'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token ?? res.data.accessToken ?? res.data?.data?.token;
      if (!token) throw new Error('No token in response');
      setToken(token);
      window.location.href = '/dashboard';
    } catch {
      alert('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    window.location.href = `${base}/auth/google`;
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="block w-full border p-2 mb-3 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="block w-full border p-2 mb-3 rounded"
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Login'}
      </button>
      <button
        onClick={handleGoogle}
        className="w-full mt-2 border py-2 rounded"
      >
        Sign in with Google
      </button>
      <p className="text-sm text-center mt-3">
        No account? <Link href="/auth/signup" className="text-blue-600">Sign up</Link>
      </p>
    </div>
  );
}


