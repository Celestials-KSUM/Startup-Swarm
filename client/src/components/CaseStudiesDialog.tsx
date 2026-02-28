"use client";

import React, { useEffect, useState } from "react";
import { X, ArrowRight, Star, Quote, Building, Zap, Rocket } from "lucide-react";

interface CaseStudy {
    id: number;
    founder: string;
    role: string;
    avatar: string;
    company: string;
    quote: string;
    metric: string;
    metricLabel: string;
    story: string;
}

const CASE_STUDIES: CaseStudy[] = [
    {
        id: 1,
        founder: "Sarah Chen",
        role: "Founder, EcoMarket",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        company: "EcoMarket",
        quote: "Startup Swarm didn't just give me a roadmap; it built the engine.",
        metric: "14 Days",
        metricLabel: "Idea to MVP Launch",
        story: "Sarah had an idea for a sustainable marketplace but no technical background. Within two weeks, our swarm generated her tech stack, market strategy, and a working beta that secured $50k in pre-seed funding.",
    },
    {
        id: 2,
        founder: "Marcus Thorne",
        role: "CEO, NexaSystems",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        company: "NexaSystems",
        quote: "The autonomous execution is like having a C-suite in your pocket.",
        metric: "400%",
        metricLabel: "Market Validation Speed",
        story: "NexaSystems used our swarm to pivot their enterprise SaaS. In 48 hours, our agents conducted 1,000+ synthetic market interviews, identifying a goldmine niche that Marcus hadn't even considered.",
    },
    {
        id: 3,
        founder: "Elena Rodriguez",
        role: "Founder, BloomEd",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        company: "BloomEd",
        quote: "I stopped fearing the 'how' and started focusing on the 'why'.",
        metric: "0 to 1",
        metricLabel: "Fully Automated Incorporation",
        story: "Elena was paralyzed by the legal and setup complexities of a global EdTech platform. Startup Swarm handled her LLC registration, compliance checks, and initial hiring roadmap automatically.",
    },
];

export default function CaseStudiesDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">

                {/* Sidebar */}
                <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Star className="w-5 h-5 text-white fill-white" />
                        </div>
                        <h3 className="font-black text-xl tracking-tight">Success Stories</h3>
                    </div>

                    <div className="space-y-3 flex-1">
                        {CASE_STUDIES.map((study, idx) => (
                            <button
                                key={study.id}
                                onClick={() => setActiveTab(idx)}
                                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left ${activeTab === idx
                                        ? "bg-white shadow-xl shadow-gray-200/50 scale-[1.02] ring-1 ring-gray-100"
                                        : "hover:bg-gray-200/50 opacity-60 hover:opacity-100"
                                    }`}
                            >
                                <img src={study.avatar} alt={study.founder} className="w-10 h-10 rounded-full bg-gray-200" />
                                <div>
                                    <p className={`font-bold text-sm ${activeTab === idx ? "text-gray-900" : "text-gray-500"}`}>{study.founder}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-blue-600">{study.company}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-8 flex items-center justify-center gap-2 p-4 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Close Dashboard
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">Verified Case Study #{CASE_STUDIES[activeTab].id}</span>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
                            &quot;{CASE_STUDIES[activeTab].quote}&quot;
                        </h2>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="p-6 rounded-3xl bg-gray-900 text-white transform -rotate-1">
                                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Impact</p>
                                <p className="text-3xl font-black">{CASE_STUDIES[activeTab].metric}</p>
                                <p className="text-xs font-bold text-blue-400">{CASE_STUDIES[activeTab].metricLabel}</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 transform rotate-1">
                                <p className="text-[10px] uppercase tracking-widest font-black text-blue-600 mb-2">Founder Status</p>
                                <p className="text-lg font-black text-gray-900">Successfully Launched</p>
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 text-blue-600 fill-blue-600" />)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <Quote className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-lg text-gray-600 font-medium leading-relaxed italic">
                                    {CASE_STUDIES[activeTab].story}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                                <img src={CASE_STUDIES[activeTab].avatar} alt="" className="w-12 h-12 rounded-full bg-gray-100" />
                                <div>
                                    <p className="font-black text-gray-900">{CASE_STUDIES[activeTab].founder}</p>
                                    <p className="text-sm font-bold text-gray-400">{CASE_STUDIES[activeTab].role}</p>
                                </div>
                                <div className="ml-auto">
                                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs hover:bg-black transition-all group">
                                        Read Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
