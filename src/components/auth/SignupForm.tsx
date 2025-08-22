'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const token = res.data.token ?? res.data.accessToken ?? res.data?.data?.token;
      if (!token) throw new Error('No token in response');
      setToken(token);
      window.location.href = '/dashboard';
    } catch {
      alert('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="block w-full border p-2 mb-3 rounded"
      />
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
        onClick={handleSignup}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Sign up'}
      </button>
      <p className="text-sm text-center mt-3">
        Have an account? <Link href="/auth/login" className="text-blue-600">Login</Link>
      </p>
    </div>
  );
}


