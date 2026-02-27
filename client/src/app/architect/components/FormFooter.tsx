'use client';
import { ArrowRight, Loader2 } from 'lucide-react';

interface FormFooterProps {
    submitting: boolean;
    onSubmit: () => void;
}

export default function FormFooter({ submitting, onSubmit }: FormFooterProps) {
    return (
        <footer className="sticky bottom-0 z-40 bg-[rgba(248,250,252,0.92)] backdrop-blur-xl
      border-t border-slate-200/60 px-6 py-4">
            <div className="max-w-[780px] mx-auto flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-[0.625rem]
            bg-[#0B1220] text-white font-semibold text-[0.95rem]
            hover:bg-[#111827] hover:shadow-[0_8px_24px_rgba(11,18,32,0.28)] hover:-translate-y-px
            disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
            transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2">
                    {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                        : <>Build Your Startup <ArrowRight className="w-4 h-4" /></>
                    }
                </button>
            </div>
        </footer>
    );
}
