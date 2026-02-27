'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { toast } from 'sonner';

import { Suspense } from 'react';

import { setToken } from '@/redux/slices/authSlice';

function AuthSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            dispatch(setToken(token));
            toast.success('Social login successful!');
            router.push('/');
        } else {

            toast.error('Authentication failed');
            router.push('/login');
        }
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthSuccessContent />
        </Suspense>
    );
}
