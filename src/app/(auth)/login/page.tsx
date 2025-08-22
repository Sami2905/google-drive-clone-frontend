'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import AuthLayout from '@/components/auth/AuthLayout';
import FormInput from '@/components/auth/FormInput';
import GoogleButton from '@/components/auth/GoogleButton';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      if (!token) throw new Error('No token in response');
      
      // Store token and user in auth store
      const authStore = useAuthStore.getState();
      authStore.setToken(token);
      authStore.setUser(user);
      
      toast.success('Welcome back!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error?.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      const res = await api.get('/auth/google');
      if (res.data.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        toast.error('Google OAuth not available');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to initiate Google OAuth';
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your files, folders and shared content.">
      <form onSubmit={onLogin} className="space-y-4">
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
          icon="mail"
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          icon="lock"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            Remember me
          </label>
          <Link href="/auth/forgot" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-60 transition"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
          <div className="relative mx-auto w-fit bg-white/80 dark:bg-slate-900/60 px-2 text-xs text-slate-500">or</div>
        </div>

        <GoogleButton onClick={onGoogle} />

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          No account?{' '}
          <Link href="/auth/signup" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
