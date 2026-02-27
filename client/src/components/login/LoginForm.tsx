'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleIcon, LinkedInIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, AlertCircleIcon, XCircleIcon } from './Icons';

interface LoginFormProps {
    onSubmit: (email: string, password: string) => Promise<string | null>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
    const [oauthLoading, setOauthLoading] = useState('');

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!email) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
        setFieldErr(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true); setError('');
        const err = await onSubmit(email, password);
        setLoading(false);
        if (err) setError(err);
        else router.push('/onboarding/startup');
    };

    const handleOAuth = async (provider: string) => {
        setOauthLoading(provider);
        await new Promise(r => setTimeout(r, 800));
        setOauthLoading('');
        router.push('/onboarding/startup');
    };

    const inputBase = "w-full py-3 px-4 bg-slate-50 border rounded-[0.625rem] text-[0.95rem] text-slate-900 font-dm-sans transition-all duration-200 focus:outline-none focus:bg-white placeholder:text-slate-400";

    return (
        <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16 bg-[#F5F7FA]">
            <div className="mx-auto w-full max-w-md">
                {/* Global error toast */}
                {error && (
                    <div className="flex items-center justify-between gap-3 mb-5 px-4 py-3 rounded-xl
            bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-up">
                        <div className="flex items-center gap-2"><AlertCircleIcon /> {error}</div>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><XCircleIcon /></button>
                    </div>
                )}

                <h1 className="font-sora font-bold text-[2rem] text-[#0B1220] mb-1.5">Welcome back</h1>
                <p className="text-slate-500 mb-8 text-[0.95rem]">Sign in to continue to StartupSwarm</p>

                {/* OAuth */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {['google', 'linkedin'].map(p => (
                        <button key={p} type="button" onClick={() => handleOAuth(p)}
                            disabled={!!oauthLoading}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white
                border border-slate-200 text-slate-700 text-sm font-medium
                hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm disabled:opacity-60
                transition-all duration-200">
                            {oauthLoading === p
                                ? <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                : p === 'google' ? <GoogleIcon /> : <LinkedInIcon />
                            }
                            {p === 'google' ? 'Continue with Google' : 'Continue with LinkedIn'}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">or continue with email</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <MailIcon />
                            </span>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com" autoComplete="email"
                                className={`${inputBase} pl-11 ${fieldErr.email ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]' : 'border-slate-200 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]'}`} />
                        </div>
                        {fieldErr.email && <span className="text-xs text-red-500">{fieldErr.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                            <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <LockIcon />
                            </span>
                            <input id="password" type={showPw ? 'text' : 'password'} value={password}
                                onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                                className={`${inputBase} pl-11 pr-11 ${fieldErr.password ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]' : 'border-slate-200 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]'}`} />
                            <button type="button" onClick={() => setShowPw(s => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                {showPw ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {fieldErr.password && <span className="text-xs text-red-500">{fieldErr.password}</span>}
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B1220] text-white
              font-dm-sans font-semibold text-[0.95rem] hover:bg-[#111827]
              hover:shadow-[0_8px_24px_rgba(11,18,32,0.25)] hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
              transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2">
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{' '}
                    <a href="/register" className="text-blue-600 font-medium hover:text-blue-700">Create one free</a>
                </p>
                <p className="mt-5 text-center text-xs text-slate-400">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="hover:underline">Terms of Service</a> and{' '}
                    <a href="/privacy" className="hover:underline">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
