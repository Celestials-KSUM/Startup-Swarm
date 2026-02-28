"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "../../lib/axios";
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
import Navbar from "@/components/Navbar";

import { INITIAL, type FormData } from './types';
import { calcStrength, strengthMeta } from './utils';
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
    const router = useRouter();
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
            const response = await axios.post("/ai/chat", {
                structuredData: form,
                threadId: threadId
            });

            const blueprintData = JSON.parse(response.data.response);
            const returnedThreadId = response.data.thread_id || threadId;

            router.push(`/history/${returnedThreadId}`);

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
        } catch (error: any) {
            console.error("Blueprint error:", error);
            if (error.response?.data?.error === "LIMIT_REACHED") {
                toast.error(error.response.data.message || "Plan limit reached.", {
                    duration: 5000,
                    action: {
                        label: "Upgrade",
                        onClick: () => router.push("/pricing")
                    }
                });
            } else {
                alert("Strategic connection lost. Please try again.");
            }
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

    // View handling shifted to dynamic route inside /history/[id]

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_50%_20%,#F8FAFC_0%,#E6ECF5_60%,#DDE5F0_100%)] font-sans pt-24">
            <Navbar />

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
