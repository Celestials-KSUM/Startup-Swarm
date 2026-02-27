'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { toast } from 'sonner';

import { Suspense } from 'react';

import { setCredentials } from '@/redux/slices/authSlice';
import { jwtDecode } from 'jwt-decode';

function AuthSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // The backend sends { id, email } in token payload
                dispatch(setCredentials({
                    token,
                    user: { id: decoded.id, email: decoded.email }
                }));
                toast.success('Social login successful!');
                router.push('/');
            } catch (error) {
                toast.error('Invalid token received');
                router.push('/login');
            }
        } else {
            toast.error('Authentication failed');
            router.push('/login');
        }
    }, [searchParams, router, dispatch]);


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
