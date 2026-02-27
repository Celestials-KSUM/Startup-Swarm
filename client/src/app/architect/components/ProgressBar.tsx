'use client';
import Link from 'next/link';
import { Check, Rocket } from 'lucide-react';

interface ProgressBarProps {
    active: number;
    onStepClick: (n: number) => void;
}

const LogoMark = () => (
    <div className="w-8 h-8 rounded-lg bg-[#0B1220] flex items-center justify-center">
        <Rocket className="w-5 h-5 text-blue-500" />
    </div>
);

export default function ProgressBar({ active, onStepClick }: ProgressBarProps) {
    const pct = Math.round(((active - 1) / 5) * 100);

    return (
        <nav className="sticky top-0 z-40 bg-[rgba(248,250,252,0.88)] backdrop-blur-xl
      border-b border-slate-200/60 shadow-[0_4px_24px_rgba(11,18,32,0.06)]"
            aria-label="Form progress">
            <div className="max-w-[780px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">

                <Link href="/" className="flex items-center gap-2 flex-shrink-0 no-underline">
                    <LogoMark />
                    <div>
                        <div className="font-bold text-sm text-[#0B1220] leading-none">StartupSwarm</div>
                        <div className="text-[0.7rem] text-slate-400 font-medium mt-0.5">Architect</div>
                    </div>
                </Link>

                <div className="hidden md:flex items-center flex-1 justify-center"
                    role="progressbar" aria-valuenow={active} aria-valuemax={6}>
                    {Array.from({ length: 6 }, (_, i) => i + 1).map((n, i) => {
                        const done = active > n;
                        const isActive = active === n;
                        return (
                            <div key={n} className="flex items-center">
                                {i > 0 && (
                                    <div className={`w-7 h-0.5 ${done ? 'bg-green-500' : 'bg-slate-200'} transition-colors duration-300`} />
                                )}
                                <button type="button" onClick={() => onStepClick(n)} title={`Section ${n}`}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-0 cursor-pointer transition-all duration-200 ${done ? 'bg-green-500 text-white'
                                            : isActive ? 'bg-blue-600 text-white shadow-[0_0_0_4px_rgba(37,99,235,0.15)]'
                                                : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                        }`}>
                                    {done ? <Check className="w-4 h-4" /> : n}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex md:hidden flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="hidden sm:block text-sm font-medium text-slate-500">Section {active} of 6</span>
                </div>
            </div>
        </nav>
    );
}
