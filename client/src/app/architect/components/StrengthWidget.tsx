'use client';

interface StrengthWidgetProps {
    pct: number;
    label: string;
    color: string;
}

export default function StrengthWidget({ pct, label, color }: StrengthWidgetProps) {
    return (
        <div className="hidden lg:block fixed bottom-24 right-6 z-50 w-48
      bg-white/75 backdrop-blur-xl border border-white/80
      shadow-[0_16px_48px_rgba(11,18,32,0.10)] rounded-2xl px-5 py-4">
            <p className="text-xs font-medium text-slate-500 mb-1">Architectural Readiness</p>
            <p className="font-bold text-[1.75rem] leading-none mb-2" style={{ color }}>
                {pct}%
            </p>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                    }}
                />
            </div>
            <p className="text-xs font-medium" style={{ color }}>{label}</p>
        </div>
    );
}
