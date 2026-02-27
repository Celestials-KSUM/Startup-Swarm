import type { ReactNode } from 'react';

interface SectionCardProps {
    num: number;
    title: string;
    icon: ReactNode;
    desc: string;
    optional?: boolean;
    onFocus?: () => void;
    children: ReactNode;
}

export default function SectionCard({
    num, title, icon, desc, optional, onFocus, children,
}: SectionCardProps) {
    return (
        <section id={`section-${num}`} onFocus={onFocus} className="px-8 py-8 md:px-12 md:py-10">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-[0.625rem] bg-blue-600/[0.08] flex items-center justify-center text-blue-600 flex-shrink-0">
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="text-[0.75rem] font-medium text-slate-400 mb-0.5 uppercase tracking-wide">Section {num} of 6</div>
                    <h2 className="font-bold text-[1.2rem] text-[#0B1220] mb-1">{title}</h2>
                    <p className="text-[0.875rem] text-slate-500">{desc}</p>
                </div>
                {optional && (
                    <span className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-purple-600 bg-purple-600/[0.08] border border-purple-600/20">
                        Optional
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-6">{children}</div>
        </section>
    );
}
