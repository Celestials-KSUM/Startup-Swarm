'use client';
import { Users } from 'lucide-react';
import FieldGroup from '../components/FieldGroup';
import SectionCard from '../components/SectionCard';
import ChipSelect from '../components/ChipSelect';
import { type FormData } from '../types';

interface Props {
    data: Pick<FormData, 'founders_count' | 'has_tech_cofounder' | 'previous_experience' | 'team_size'>;
    errors: Record<string, string>;
    set: (k: keyof FormData, v: any) => void;
    onFocus: () => void;
}

const EXPERIENCE = [
    'First-time founder', '1 previous startup', '2+ previous startups',
    'Exited before', 'Corporate background', 'Academic background'
];
const TEAM_SIZES = ['Solo', '2-3', '4-5', '6-10', '10+'];

export default function TeamSection({ data, errors, set, onFocus }: Props) {
    return (
        <SectionCard num={5} title="Team Information" icon={<Users className="w-5 h-5" />}
            desc="The builders behind the vision." onFocus={onFocus}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldGroup label="Number of Founders" required error={errors.founders_count}>
                    <div className="flex items-center gap-4">
                        {[1, 2, 3, 4, '5+'].map(num => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => set('founders_count', typeof num === 'string' ? 5 : num)}
                                className={`w-10 h-10 rounded-lg border font-bold transition-all ${(typeof num === 'string' ? data.founders_count >= 5 : data.founders_count === num)
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </FieldGroup>

                <FieldGroup label="Technical Co-founder?" required error={errors.has_tech_cofounder === null ? errors.has_tech_cofounder : ''}>
                    <div className="flex gap-2">
                        {['Yes', 'No'].map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => set('has_tech_cofounder', opt === 'Yes')}
                                className={`px-6 py-2 rounded-lg border font-medium transition-all ${(data.has_tech_cofounder === (opt === 'Yes'))
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </FieldGroup>
            </div>

            <FieldGroup label="Previous Experience" required error={errors.previous_experience}>
                <ChipSelect options={EXPERIENCE} selected={data.previous_experience}
                    onChange={v => set('previous_experience', v)} />
            </FieldGroup>

            <FieldGroup label="Current Team Size" required error={errors.team_size}>
                <ChipSelect options={TEAM_SIZES} selected={data.team_size}
                    onChange={v => set('team_size', v)} />
            </FieldGroup>
        </SectionCard>
    );
}
