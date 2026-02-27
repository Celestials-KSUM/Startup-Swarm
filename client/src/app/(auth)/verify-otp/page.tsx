'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, setRegistrationEmail } from '@/redux/slices/authSlice';
import { otpSchema, type OtpFormData } from '@/validations/auth';
import { AppDispatch, RootState } from '@/redux/store';
import { toast } from 'sonner';
import LeftPanel from '@/components/login/LeftPanel';

export default function VerifyOtpPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { loading, registrationEmail } = useSelector((state: RootState) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
    });

    useEffect(() => {
        if (!registrationEmail) {
            toast.error('No registration email found. Please register again.');
            router.push('/register');
        }
    }, [registrationEmail, router]);

    const onSubmit = async (data: OtpFormData) => {
        if (!registrationEmail) return;

        try {
            const resultAction = await dispatch(verifyOtp({ email: registrationEmail, otp: data.otp }));
            if (verifyOtp.fulfilled.match(resultAction)) {
                toast.success('Verification successful!');
                router.push('/');
            } else {
                toast.error(resultAction.payload as string || 'Verification failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F5F7FA]">
            <LeftPanel />
            <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16 bg-[#F5F7FA]">
                <div className="mx-auto w-full max-w-md">
                    <h1 className="font-sora font-bold text-[2rem] text-[#0B1220] mb-1.5">Verify Email</h1>
                    <p className="text-slate-500 mb-8 text-[0.95rem]">
                        We&apos;ve sent a 6-digit code to <span className="font-semibold text-slate-700">{registrationEmail}</span>
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="otp" className="text-sm font-medium text-slate-700">Verification Code</label>
                            <input
                                id="otp"
                                type="text"
                                {...register('otp')}
                                placeholder="123456"
                                maxLength={6}
                                className="w-full py-4 px-4 bg-white border border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all"
                            />
                            {errors.otp && <span className="text-xs text-red-500">{errors.otp.message}</span>}
                        </div>

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
                                'Verify & Continue'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Didn&apos;t receive the code?{' '}
                        <button onClick={() => toast.info('OTP Resend logic not implemented yet')} className="text-blue-600 font-medium hover:text-blue-700">Resend Code</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
