import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldGroupProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    optional?: boolean;
    helper?: string;
    error?: string;
    charCount?: number;
    charMax?: number;
    children: ReactNode;
}

export default function FieldGroup({
    label, htmlFor, required, optional, helper, error, charCount, charMax, children,
}: FieldGroupProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
                    {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {optional && (
                    <span className="px-2 py-0.5 rounded-full text-[0.72rem] font-medium text-purple-600
            bg-purple-600/[0.08] border border-purple-600/20">
                        Optional
                    </span>
                )}
            </div>
            {children}
            {charMax !== undefined && charCount !== undefined && (
                <span className={`text-[0.78rem] text-right ${charCount > charMax * 0.85 ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                    {charCount}/{charMax}
                </span>
            )}
            {helper && !error && <span className="text-[0.8rem] text-slate-400">{helper}</span>}
            {error && (
                <span className="flex items-center gap-1.5 text-[0.8rem] text-red-500">
                    <AlertCircle className="w-3 h-3" /> {error}
                </span>
            )}
        </div>
    );
}
