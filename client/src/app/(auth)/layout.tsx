'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Navbar from '@/components/Navbar';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (token) {
            router.push('/');
        } else {
            setIsChecking(false);
        }
    }, [token, router]);

    if (isChecking && token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111827]"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
