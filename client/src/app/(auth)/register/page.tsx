// Register page — thin orchestrator: renders LeftPanel + RegisterForm
'use client';
import LeftPanel from '@/components/login/LeftPanel';
import RegisterForm from '@/components/login/RegisterForm';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex bg-[#F5F7FA]">
            {/* Left panel: particle animation + branding */}
            <LeftPanel />

            {/* Right panel: the register form */}
            <RegisterForm />
        </div>
    );
}
