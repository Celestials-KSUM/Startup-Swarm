// Login page — thin orchestrator: state + handlers only, renders LeftPanel + LoginForm
'use client';
import LeftPanel from '@/components/login/LeftPanel';
import LoginForm from '@/components/login/LoginForm';

async function authenticate(email: string, password: string): Promise<string | null> {
    // Replace with real NextAuth signIn call:
    // const result = await signIn('credentials', { email, password, redirect: false });
    // if (result?.error) return 'Invalid email or password.';
    await new Promise(r => setTimeout(r, 1000));
    if (password === 'wrongpass') return 'Invalid email or password. Please try again.';
    return null;
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex bg-[#F5F7FA]">
            {/* Left panel: particle animation + branding */}
            <LeftPanel />

            {/* Right panel: the form */}
            <LoginForm onSubmit={authenticate} />
        </div>
    );
}
