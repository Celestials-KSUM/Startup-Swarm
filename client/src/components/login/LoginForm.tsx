'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '@/redux/slices/authSlice';
import { loginSchema, type LoginFormData } from '@/validations/auth';
import { AppDispatch, RootState } from '@/redux/store';
import { toast } from 'sonner';
import { GoogleIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from './Icons';
import { authApiService } from '@/services/authApiService';

export default function LoginForm() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);
    const [showPw, setShowPw] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const resultAction = await dispatch(loginUser(data));
            if (loginUser.fulfilled.match(resultAction)) {
                toast.success('Login successful!');
                router.push('/');
            } else {
                toast.error(resultAction.payload as string || 'Login failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = authApiService.getGoogleAuthUrl();
    };

    const inputBase = "w-full py-3 px-4 bg-slate-50 border rounded-[0.625rem] text-[0.95rem] text-slate-900 font-dm-sans transition-all duration-200 focus:outline-none focus:bg-white placeholder:text-slate-400";

    return (
        <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16 bg-[#F5F7FA]">
            <div className="mx-auto w-full max-w-md">
                <h1 className="font-sora font-bold text-[2rem] text-[#0B1220] mb-1.5">Welcome back</h1>
                <p className="text-slate-500 mb-8 text-[0.95rem]">Sign in to remove the fear and start your business.</p>

                {/* OAuth */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white
              border border-slate-200 text-slate-700 text-sm font-medium
              hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm
              transition-all duration-200"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">or continue with email</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <MailIcon />
                            </span>
                            <input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="you@company.com"
                                autoComplete="email"
                                className={`${inputBase} pl-11 ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-blue-600'}`}
                            />
                        </div>
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
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
                            <input
                                id="password"
                                type={showPw ? 'text' : 'password'}
                                {...register('password')}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className={`${inputBase} pl-11 pr-11 ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-blue-600'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((s) => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPw ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B1220] text-white
              font-dm-sans font-semibold text-[0.95rem] hover:bg-[#111827]
              hover:shadow-[0_8px_24px_rgba(11,18,32,0.25)] hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
              transition-all duration-200"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{' '}
                    <a href="/register" className="text-blue-600 font-medium hover:text-blue-700">Create one free</a>
                </p>
            </div>
        </div>
    );
}
