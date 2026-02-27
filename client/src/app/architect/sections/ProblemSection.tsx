'use client';
import { Lightbulb } from 'lucide-react';
import FieldGroup from '../components/FieldGroup';
import SectionCard from '../components/SectionCard';
import { type FormData } from '../types';

interface Props {
    data: Pick<FormData, 'problem_statement'>;
    errors: Record<string, string>;
    set: (k: keyof FormData, v: any) => void;
    onFocus: () => void;
}

export default function ProblemSection({ data, errors, set, onFocus }: Props) {
    return (
        <SectionCard num={2} title="Problem & Solution" icon={<Lightbulb className="w-5 h-5" />}
            desc="What pain point are you solving?" onFocus={onFocus}>

            <FieldGroup label="The Core Problem" required htmlFor="problem_statement"
                error={errors.problem_statement} charCount={data.problem_statement.length} charMax={500}>
                <textarea
                    id="problem_statement"
                    rows={4}
                    maxLength={500}
                    placeholder="Describe the main challenge your target audience faces."
                    value={data.problem_statement}
                    onChange={e => set('problem_statement', e.target.value)}
                    className={`w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-[0.625rem] text-[0.95rem] text-slate-900 transition-all focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:bg-white placeholder:text-slate-400 resize-y leading-relaxed ${errors.problem_statement ? 'border-red-400' : ''
                        }`}
                />
            </FieldGroup>
        </SectionCard>
    );
}
