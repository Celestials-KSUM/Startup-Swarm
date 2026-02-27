// Register page — thin orchestrator: state + handlers only, renders LeftPanel + RegisterForm
'use client';
import LeftPanel from '@/components/login/LeftPanel';
import RegisterForm from '@/components/login/RegisterForm';

async function handleRegister(username: string, email: string, password: string): Promise<string | null> {
    // Replace with real registration call:
    // const result = await signUp({ username, email, password });
    await new Promise(r => setTimeout(r, 1000));
    if (email.includes('error')) return 'Registration failed. This email is already in use.';
    return null;
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex bg-[#F5F7FA]">
            {/* Left panel: particle animation + branding */}
            <LeftPanel />

            {/* Right panel: the register form */}
            <RegisterForm onSubmit={handleRegister} />
        </div>
    );
}
