'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import AuthLayout from '@/components/auth/AuthLayout';
import FormInput from '@/components/auth/FormInput';
import GoogleButton from '@/components/auth/GoogleButton';
import Link from 'next/link';

function strengthScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => strengthScore(pw), [pw]);
  const pct = (score / 4) * 100;
  const barColor =
    score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-amber-500' : score === 3 ? 'bg-lime-500' : 'bg-green-600';

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirm) return toast.error('Passwords do not match');
    if (score < 2) return toast.error('Choose a stronger password');
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', { name, email, password: pw });
      const token = res.data.token;
      if (!token) throw new Error('No token in response');
      localStorage.setItem('token', token);
      toast.success('Account created!');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error?.response?.data?.error || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    window.location.href = `${base}/auth/google`;
  };

  return (
    <AuthLayout title="Create your account" subtitle="Your first 5 GB are on us. Upgrade anytime.">
      <form onSubmit={onSignup} className="space-y-4">
        <FormInput
          label="Full name"
          name="name"
          icon="user"
          value={name}
          onChange={setName}
          placeholder="Jane Doe"
          autoComplete="name"
          required
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          icon="mail"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <div className="space-y-3">
          <FormInput
            label="Password"
            name="password"
            type="password"
            icon="lock"
            value={pw}
            onChange={setPw}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
          {/* Strength meter */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use at least 8 characters, with a mix of letters, numbers, and symbols.
          </p>
        </div>
        <FormInput
          label="Confirm password"
          name="confirm"
          type="password"
          icon="lock"
          value={confirm}
          onChange={setConfirm}
          placeholder="Re-enter password"
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-60 transition"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
          <div className="relative mx-auto w-fit bg-white/80 dark:bg-slate-900/60 px-2 text-xs text-slate-500">or</div>
        </div>

        <GoogleButton onClick={onGoogle} label="Sign up with Google" />

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
