'use client';

interface ChipSelectProps {
    options: string[];
    selected: string | string[];
    multi?: boolean;
    max?: number;
    onChange: (v: string | string[]) => void;
}

export default function ChipSelect({ options, selected, multi, max, onChange }: ChipSelectProps) {
    const toggle = (opt: string) => {
        if (multi) {
            const arr = selected as string[];
            if (arr.includes(opt)) {
                onChange(arr.filter(x => x !== opt));
            } else if (!max || arr.length < max) {
                onChange([...arr, opt]);
            }
        } else {
            onChange(selected === opt ? '' : opt);
        }
    };

    const isSelected = (opt: string) =>
        multi ? (selected as string[]).includes(opt) : selected === opt;

    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={`px-4 py-[0.45rem] rounded-full border text-sm font-medium cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 ${isSelected(opt)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] scale-100'
                            : 'bg-blue-600/[0.06] border-blue-600/20 text-blue-600 hover:bg-blue-600/[0.12] hover:-translate-y-px'
                        }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}
