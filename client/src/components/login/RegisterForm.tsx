'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '@/redux/slices/authSlice';
import { registerSchema, type RegisterFormData } from '@/validations/auth';
import { AppDispatch, RootState } from '@/redux/store';
import { toast } from 'sonner';
import { GoogleIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from './Icons';
import { authApiService } from '@/services/authApiService';

export default function RegisterForm() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.auth);
    const [showPw, setShowPw] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data: RegisterFormData) => {
        if (!termsAccepted) {
            toast.error('You must accept the terms and conditions');
            return;
        }

        try {
            const resultAction = await dispatch(registerUser(data));
            if (registerUser.fulfilled.match(resultAction)) {
                toast.success('Registration successful! Please verify your email.');
                router.push('/verify-otp');
            } else {
                toast.error(resultAction.payload as string || 'Registration failed');
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
                <h1 className="font-sora font-bold text-[2rem] text-[#0B1220] mb-1.5">Create account</h1>
                <p className="text-slate-500 mb-8 text-[0.95rem]">Join StartupSwarm to launch your idea</p>

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
                    <span className="text-xs text-slate-400 font-medium">or register with email</span>
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
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <LockIcon />
                            </span>
                            <input
                                id="password"
                                type={showPw ? 'text' : 'password'}
                                {...register('password')}
                                placeholder="••••••••"
                                autoComplete="new-password"
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

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <LockIcon />
                            </span>
                            <input
                                id="confirmPassword"
                                type={showPw ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                placeholder="••••••••"
                                className={`${inputBase} pl-11 pr-11 ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200 focus:border-blue-600'}`}
                            />
                        </div>
                        {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
                    </div>

                    {/* Terms */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="peer h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 transition-all cursor-pointer accent-blue-600"
                                />
                            </div>
                            <span className="text-sm text-slate-600 leading-tight">
                                I agree to the <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B1220] text-white
              font-dm-sans font-semibold text-[0.95rem] hover:bg-[#111827]
              hover:shadow-[0_8px_24px_rgba(11,18,32,0.25)] hover:-translate-y-0.5
              transition-all duration-200"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Create account'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 font-medium hover:text-blue-700">Sign in</a>
                </p>
            </div>
        </div>
    );
}
