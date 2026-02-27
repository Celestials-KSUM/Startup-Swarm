// Login page — thin orchestrator: renders LeftPanel + LoginForm
'use client';
import LeftPanel from '@/components/login/LeftPanel';
import LoginForm from '@/components/login/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex bg-[#F5F7FA]">
            {/* Left panel: particle animation + branding */}
            <LeftPanel />

            {/* Right panel: the form */}
            <LoginForm />
        </div>
    );
}
