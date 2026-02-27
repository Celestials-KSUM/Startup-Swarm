'use client';
import { Paperclip, Globe, Github, Video, Link as LinkIcon } from 'lucide-react';
import FieldGroup from '../components/FieldGroup';
import SectionCard from '../components/SectionCard';
import { type FormData } from '../types';

interface Props {
    data: Pick<FormData, 'website_url' | 'demo_link' | 'github_repo' | 'demo_video'>;
    set: (k: keyof FormData, v: any) => void;
    onFocus: () => void;
}

const input = 'w-full py-3 px-4 pl-10 bg-slate-50 border border-slate-200 rounded-[0.625rem] text-[0.95rem] text-slate-900 transition-all focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus:bg-white placeholder:text-slate-400';

export default function ResourcesSection({ data, set, onFocus }: Props) {
    return (
        <SectionCard num={6} title="Resources & Links" icon={<Paperclip className="w-5 h-5" />}
            desc="Optional materials to strengthen your profile." optional onFocus={onFocus}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldGroup label="Website URL" optional htmlFor="website_url">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Globe className="w-4 h-4" /></span>
                        <input id="website_url" type="url" className={input} placeholder="https://..."
                            value={data.website_url} onChange={e => set('website_url', e.target.value)} />
                    </div>
                </FieldGroup>

                <FieldGroup label="Demo / MVP Link" optional htmlFor="demo_link">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><LinkIcon className="w-4 h-4" /></span>
                        <input id="demo_link" type="url" className={input} placeholder="https://..."
                            value={data.demo_link} onChange={e => set('demo_link', e.target.value)} />
                    </div>
                </FieldGroup>

                <FieldGroup label="GitHub Repo" optional htmlFor="github_repo">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Github className="w-4 h-4" /></span>
                        <input id="github_repo" type="url" className={input} placeholder="https://github.com/..."
                            value={data.github_repo} onChange={e => set('github_repo', e.target.value)} />
                    </div>
                </FieldGroup>

                <FieldGroup label="Demo Video" optional htmlFor="demo_video">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Video className="w-4 h-4" /></span>
                        <input id="demo_video" type="url" className={input} placeholder="Loom/YouTube URL"
                            value={data.demo_video} onChange={e => set('demo_video', e.target.value)} />
                    </div>
                </FieldGroup>
            </div>
        </SectionCard>
    );
}
