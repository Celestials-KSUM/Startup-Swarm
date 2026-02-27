"use client";

import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
    Loader2,
    BarChart3,
    ShieldCheck,
    AlertCircle,
    Zap,
    Target,
    TrendingUp,
    Scale,
    Users,
    Coins,
    Server,
    Globe,
    Truck,
    Cpu,
    Building2,
    Handshake,
    Briefcase,
    Construction
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { INITIAL, type FormData } from './types';
import { calcStrength, strengthMeta } from './utils';
import ProgressBar from './components/ProgressBar';
import StrengthWidget from './components/StrengthWidget';
import FormFooter from './components/FormFooter';

import IdentitySection from './sections/IdentitySection';
import ProblemSection from './sections/ProblemSection';
import MarketSection from './sections/MarketSection';
import CategorySection from './sections/CategorySection';
import TeamSection from './sections/TeamSection';
import ResourcesSection from './sections/ResourcesSection';

export default function ArchitectPage() {
    const [form, setForm] = useState<FormData>(INITIAL);
    const [active, setActive] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [blueprint, setBlueprint] = useState<any>(null);
    const [view, setView] = useState<"form" | "blueprint">("form");
    const [threadId, setThreadId] = useState("");

    useEffect(() => {
        setThreadId(uuidv4());
    }, []);

    const set = useCallback((key: keyof FormData, val: any) => {
        setForm(prev => ({ ...prev, [key]: val }));
        setErrors(prev => {
            const n = { ...prev };
            delete n[key];
            return n;
        });
    }, []);

    const scrollToSection = (n: number) => {
        setActive(n);
        document.getElementById(`section-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSubmit = async () => {
        // Validation removed as per user request
        setErrors({});

        setSubmitting(true);
        try {
            const response = await axios.post("http://localhost:5000/api/ai/chat", {
                structuredData: form,
                threadId: threadId
            });

            const blueprintData = JSON.parse(response.data.response);
            setBlueprint(blueprintData);
            setView("blueprint");
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Auto-launch handling
            if (blueprintData.execution?.website_builder?.url) {
                toast.success("Website Swarm completed!", {
                    description: `Launching ${blueprintData.execution.website_builder.config?.brandName || 'your startup website'}...`,
                    duration: 5000,
                });

                const url = blueprintData.execution.website_builder.url;
                // Try to open, if blocked, the user has the card to click
                const win = window.open(url, '_blank');
                if (!win || win.closed || typeof win.closed == 'undefined') {
                    toast.info("Pop-up blocked", {
                        description: "Please click the 'Launch' button in the blueprint to view your website.",
                    });
                }
            } else {
                toast.info("Blueprint Ready", {
                    description: "Strategic analysis completed successfully.",
                });
            }
        } catch (error) {
            console.error("Blueprint error:", error);
            alert("Strategic connection lost. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const pct = calcStrength(form);
    const meta = strengthMeta(pct);

    const ScoreCard = ({ title, score, insight, icon: Icon, color }: { title: string, score: number, insight: string, icon: any, color: string }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className="text-right">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Score</span>
                    <span className="text-2xl font-black text-gray-900">{score}%</span>
                </div>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{insight}</p>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );

    if (view === "blueprint") {
        return (
            <div className="min-h-screen bg-white p-8 animate-in fade-in duration-700">
                <div className="max-w-7xl mx-auto">
                    <header className="flex items-center justify-between mb-12">
                        <div>
                            <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.3em]">Execution Strategy Blueprint</span>
                            <h1 className="text-4xl font-black text-[#111827] mt-2">The Architecture</h1>
                        </div>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest transition-colors">Start New Analysis</button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <ScoreCard title="Market Viability" score={blueprint.agentScoring?.marketResearch?.score || 0} insight={blueprint.agentScoring?.marketResearch?.insight || ""} icon={BarChart3} color="bg-emerald-500" />
                        <ScoreCard title="Defensibility" score={blueprint.agentScoring?.competitionIntel?.score || 0} insight={blueprint.agentScoring?.competitionIntel?.insight || ""} icon={ShieldCheck} color="bg-blue-500" />
                        <ScoreCard title="Execution Risk" score={blueprint.agentScoring?.executionRisk?.score || 0} insight={blueprint.agentScoring?.executionRisk?.insight || ""} icon={AlertCircle} color="bg-rose-500" />
                        <ScoreCard title="Tech Feasibility" score={blueprint.agentScoring?.techFeasibility?.score || 0} insight={blueprint.agentScoring?.techFeasibility?.insight || ""} icon={Zap} color="bg-amber-500" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Execution Agent: Website Builder */}
                            {blueprint.execution?.website_builder && (
                                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative mb-8">
                                    <div className="absolute top-0 right-0 p-12 -translate-y-1/2 translate-x-1/2 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-black mb-4 flex items-center gap-3">
                                            <Globe className="w-6 h-6" />
                                            Digital Presence Engine
                                            <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                                Ready
                                            </span>
                                        </h3>
                                        <p className="text-blue-100 mb-8 max-w-sm text-sm font-medium leading-relaxed">
                                            Our AI has designed and deployed a custom high-conversion website for <strong>{blueprint.execution.website_builder.config?.brandName || form.startup_name}</strong>.
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <a
                                                href={blueprint.execution.website_builder.url}
                                                target="_blank"
                                                className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform inline-flex items-center gap-2"
                                            >
                                                Launch Website <Zap className="w-4 h-4 fill-current" />
                                            </a>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                                                    Template: {blueprint.execution.website_builder.template}
                                                </div>
                                                <div className="text-[10px] font-mono text-white/40 break-all select-all cursor-copy" title="Click to copy">
                                                    http://localhost:3000{blueprint.execution.website_builder.url}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Execution Agent: Company Registration */}
                            {blueprint.execution?.registration && (
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-500" />
                                        Registration Roadmap
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Required Documents</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    {blueprint.execution.registration.documentsRequired?.map((doc: string, idx: number) => (
                                                        <li key={idx} className="flex items-start gap-2">• {doc}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Checklist</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    {blueprint.execution.registration.incorporationChecklist?.map((item: string, idx: number) => (
                                                        <li key={idx} className="flex items-start gap-2">✓ {item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Strategic Summary */}
                            <div className="bg-[#111827] text-white p-10 rounded-[2.5rem] shadow-2xl">
                                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-blue-400 mb-6">Strategic Summary</h3>
                                <h2 className="text-3xl font-bold mb-4">{blueprint.businessOverview?.name || form.startup_name}</h2>
                                <p className="text-blue-100/80 text-lg leading-relaxed mb-8 font-medium italic underline decoration-blue-500/30 underline-offset-8">
                                    {blueprint.businessOverview?.valueProposition || "Building the future of " + form.startup_category}
                                </p>
                                <div className="prose prose-invert max-w-none text-gray-300">
                                    <ReactMarkdown>{blueprint.businessOverview?.description || ""}</ReactMarkdown>
                                </div>
                            </div>

                            {/* Roadmap */}
                            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">
                                <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Construction className="text-blue-600" /> Strategic Roadmap</h3>
                                <div className="space-y-4">
                                    {blueprint.strategicRoadmap?.map((step: string, i: number) => (
                                        <div key={i} className="flex gap-6 items-start">
                                            <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">{i + 1}</div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-1">
                                                <p className="text-gray-800 font-semibold text-sm">{step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Outreach & Revenue */}
                        <div className="space-y-8">
                            {blueprint.execution?.outreach && (
                                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                        <Handshake className="w-5 h-5 text-emerald-500" />
                                        Partnerships
                                    </h3>
                                    <div className="space-y-4">
                                        {blueprint.execution.outreach.potentialPartners?.slice(0, 5).map((partner: string, idx: number) => (
                                            <div key={idx} className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-700">
                                                {partner}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {blueprint.revenueModel && (
                                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-black mb-6 items-center flex gap-2">
                                        <Coins className="w-5 h-5 text-amber-500" />
                                        Economics
                                    </h3>
                                    <div className="space-y-4">
                                        {blueprint.revenueModel.map((item: string, i: number) => (
                                            <div key={i} className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs font-bold text-amber-700">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_50%_20%,#F8FAFC_0%,#E6ECF5_60%,#DDE5F0_100%)] font-sans">
            <ProgressBar active={active} onStepClick={scrollToSection} />

            <header className="max-w-[780px] mx-auto px-6 pt-12 pb-8 animate-in fade-in slide-in-from-bottom duration-700">
                <h1 className="font-bold text-[clamp(1.75rem,4vw,2.75rem)] text-[#0B1220] mb-3 leading-tight tracking-tight">
                    Architect your{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">startup</span>
                </h1>
                <p className="text-[1.05rem] text-slate-500 max-w-lg leading-relaxed mb-2">
                    Define your startup's core structure and let our specialized agent swarm engineer your strategic blueprint.
                </p>
                <p className="text-xs text-slate-400">Fields marked with * are required</p>

                {/* Mobile strength bar */}
                <div className="lg:hidden mt-5 bg-white/60 backdrop-blur-md border border-white/75 rounded-xl px-4 py-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">Architectural Readiness</p>
                    <p className="font-bold text-2xl mb-1.5" style={{ color: meta.color }}>{pct}%</p>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500"
                            style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: meta.color }}>{meta.label}</p>
                </div>
            </header>

            <main className="max-w-[780px] mx-auto px-6 pb-32">
                <div className="bg-white/70 backdrop-blur-xl border border-white/80
          shadow-[0_8px_40px_rgba(11,18,32,0.09)]
          rounded-2xl overflow-hidden divide-y divide-slate-200/70
          animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                    <IdentitySection data={form} errors={errors} set={set} onFocus={() => setActive(1)} />
                    <ProblemSection data={form} errors={errors} set={set} onFocus={() => setActive(2)} />
                    <MarketSection data={form} errors={errors} set={set} onFocus={() => setActive(3)} />
                    <CategorySection data={form} errors={errors} set={set} onFocus={() => setActive(4)} />
                    <TeamSection data={form} errors={errors} set={set} onFocus={() => setActive(5)} />
                    <ResourcesSection data={form} set={set} onFocus={() => setActive(6)} />
                </div>
            </main>

            <StrengthWidget pct={pct} label={meta.label} color={meta.color} />
            <FormFooter submitting={submitting} onSubmit={handleSubmit} />
        </div>
    );
}
