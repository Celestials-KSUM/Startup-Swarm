'use client';
import { Rocket, Tag } from 'lucide-react';
import FieldGroup from '../components/FieldGroup';
import SectionCard from '../components/SectionCard';
import { type FormData } from '../types';

interface Props {
    data: Pick<FormData, 'startup_name' | 'idea_description'>;
    errors: Record<string, string>;
    set: (k: keyof FormData, v: any) => void;
    onFocus: () => void;
}

export default function IdentitySection({ data, errors, set, onFocus }: Props) {
    return (
        <SectionCard num={1} title="Identity" icon={<Rocket className="w-5 h-5" />}
            desc="The foundation of your vision." onFocus={onFocus}>

            <FieldGroup label="Startup Name" required htmlFor="startup_name" error={errors.startup_name}>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                        <Tag className="w-4 h-4" />
                    </span>
                    <input
                        id="startup_name"
                        type="text"
                        placeholder="e.g. StartupSwarm"
                        maxLength={60}
                        value={data.startup_name}
                        onChange={e => set('startup_name', e.target.value)}
                        className={`w-full py-3 px-4 pl-11 bg-slate-50 border border-slate-200 rounded-[0.625rem] text-[0.95rem] text-slate-900 transition-all focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:bg-white placeholder:text-slate-400 ${errors.startup_name ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]' : ''
                            }`}
                    />
                </div>
            </FieldGroup>

            <FieldGroup label="The Big Vision" required htmlFor="idea_description" error={errors.idea_description}
                charCount={data.idea_description.length} charMax={400}>
                <textarea
                    id="idea_description"
                    rows={4}
                    maxLength={400}
                    placeholder="What are you building and who is it for?"
                    value={data.idea_description}
                    onChange={e => set('idea_description', e.target.value)}
                    className={`w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-[0.625rem] text-[0.95rem] text-slate-900 transition-all focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:bg-white placeholder:text-slate-400 resize-y min-h-[96px] leading-relaxed ${errors.idea_description ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]' : ''
                        }`}
                />
            </FieldGroup>
        </SectionCard>
    );
}
