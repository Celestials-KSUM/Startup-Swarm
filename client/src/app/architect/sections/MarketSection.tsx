'use client';
import { Target } from 'lucide-react';
import FieldGroup from '../components/FieldGroup';
import SectionCard from '../components/SectionCard';
import ChipSelect from '../components/ChipSelect';
import { type FormData } from '../types';

interface Props {
    data: Pick<FormData, 'target_users' | 'business_model_type'>;
    errors: Record<string, string>;
    set: (k: keyof FormData, v: any) => void;
    onFocus: () => void;
}

export default function MarketSection({ data, errors, set, onFocus }: Props) {
    return (
        <SectionCard num={3} title="Target Market" icon={<Target className="w-5 h-5" />}
            desc="Who exactly is this for?" onFocus={onFocus}>

            <FieldGroup label="Target Users / Persona" required htmlFor="target_users"
                error={errors.target_users} charCount={data.target_users.length} charMax={400}>
                <textarea
                    id="target_users"
                    rows={3}
                    maxLength={400}
                    placeholder="Be specific. e.g. 'Freelance writers in the US earning $50k+'"
                    value={data.target_users}
                    onChange={e => set('target_users', e.target.value)}
                    className={`w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-[0.625rem] text-[0.95rem] text-slate-900 transition-all focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:bg-white placeholder:text-slate-400 resize-y leading-relaxed ${errors.target_users ? 'border-red-400' : ''
                        }`}
                />
            </FieldGroup>

            <FieldGroup label="Business Model Type" required error={errors.business_model_type}>
                <ChipSelect
                    options={['B2B', 'B2C', 'B2G', 'D2C', 'B2B2C', 'Marketplace']}
                    selected={data.business_model_type}
                    onChange={v => set('business_model_type', v)}
                />
            </FieldGroup>
        </SectionCard>
    );
}
