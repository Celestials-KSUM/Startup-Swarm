"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
    Loader2,
    BarChart3,
    ShieldCheck,
    AlertCircle,
    Zap,
    Globe,
    Building2,
    Handshake,
    Coins,
    Construction
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SessionBlueprintPage() {
    const params = useParams();
    const router = useRouter();
    const threadId = params?.id as string;

    const [blueprint, setBlueprint] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!threadId) return;

        const fetchHistory = async () => {
            try {
                // Fetch specific thread history
                const response = await axios.get(`http://localhost:5000/api/ai/history/${threadId}`, {
                    withCredentials: true
                });

                if (response.data && response.data.length > 0) {
                    const latestRun = response.data[0];
                    setBlueprint(latestRun.data);
                } else {
                    setError("Session not found or has been deleted.");
                }
            } catch (err: any) {
                console.error("Error fetching session:", err);
                setError(err.response?.data?.error || "Failed to load session details.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [threadId]);

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
                <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{insight || "Pending analysis."}</p>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading session blueprint...</p>
            </div>
        );
    }

    if (error || !blueprint) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
                <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unavailable Session</h2>
                <p className="text-gray-600 mb-8">{error}</p>
                <button onClick={() => router.push('/architect')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                    Start New Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-8 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.3em]">Execution Strategy Blueprint</span>
                        <h1 className="text-4xl font-black text-[#111827] mt-2">The Architecture</h1>
                        <p className="text-gray-500 text-sm mt-3 flex items-center gap-2">
                            Session ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{threadId}</code>
                        </p>
                    </div>
                    <button onClick={() => router.push('/architect')} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest transition-colors">Start New Analysis</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <ScoreCard title="Market Viability" score={blueprint.agentScoring?.marketResearch?.score || blueprint.agentScoring?.market?.score || 0} insight={blueprint.agentScoring?.marketResearch?.insight || blueprint.agentScoring?.market?.insight || ""} icon={BarChart3} color="bg-emerald-500" />
                    <ScoreCard title="Defensibility" score={blueprint.agentScoring?.competitionIntel?.score || blueprint.agentScoring?.competition?.score || 0} insight={blueprint.agentScoring?.competitionIntel?.insight || blueprint.agentScoring?.competition?.insight || ""} icon={ShieldCheck} color="bg-blue-500" />
                    <ScoreCard title="Execution Risk" score={blueprint.agentScoring?.executionRisk?.score || blueprint.agentScoring?.execution?.score || 0} insight={blueprint.agentScoring?.executionRisk?.insight || blueprint.agentScoring?.execution?.insight || ""} icon={AlertCircle} color="bg-rose-500" />
                    <ScoreCard title="Tech Feasibility" score={blueprint.agentScoring?.techFeasibility?.score || blueprint.agentScoring?.tech?.score || 0} insight={blueprint.agentScoring?.techFeasibility?.insight || blueprint.agentScoring?.tech?.insight || ""} icon={Zap} color="bg-amber-500" />
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
                                        Our AI has designed and deployed a custom high-conversion website for <strong>{blueprint.execution.website_builder.config?.brandName || blueprint.businessOverview?.name}</strong>.
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
                            <h2 className="text-3xl font-bold mb-4">{blueprint.businessOverview?.name}</h2>
                            <p className="text-blue-100/80 text-lg leading-relaxed mb-8 font-medium italic underline decoration-blue-500/30 underline-offset-8">
                                {blueprint.businessOverview?.valueProposition}
                            </p>
                            <div className="prose prose-invert max-w-none text-gray-300">
                                <ReactMarkdown>{blueprint.businessOverview?.description || ""}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Roadmap */}
                        {blueprint.strategicRoadmap && (
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
                        )}
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
