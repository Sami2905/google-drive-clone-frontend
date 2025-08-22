'use client';
import { useState } from 'react';

// Simple icon components since we don't have react-icons installed yet
const FiMail = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FiLock = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width={18} height={11} x={3} y={11} rx={2} ry={2} /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const FiUser = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const FiEye = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const FiEyeOff = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>;

type Props = {
  label: string;
  type?: 'text' | 'email' | 'password';
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  icon?: 'mail' | 'lock' | 'user';
  error?: string;
};

export default function FormInput({
  label, type = 'text', name, value, onChange,
  placeholder, autoComplete, required, icon, error,
}: Props) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);

  const LeftIcon = icon === 'mail' ? FiMail : icon === 'lock' ? FiLock : FiUser;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      <div className={`group relative flex items-center rounded-lg border bg-white/80 dark:bg-slate-900/60 
        border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 transition`}>
        <span className="pl-3 pr-2 text-slate-500 dark:text-slate-400">
          <LeftIcon />
        </span>
        <input
          id={name}
          name={name}
          aria-label={label}
          type={type === 'password' ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={(e) => setCaps((e.getModifierState && e.getModifierState('CapsLock')) || false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="peer w-full bg-transparent py-2.5 pr-12 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
        />
        {type === 'password' && (
          <button
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            {show ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {caps && type === 'password' && (
        <p className="text-xs text-amber-600">Caps Lock is on</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
