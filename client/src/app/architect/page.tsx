"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "../../lib/axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
    BrainCircuit,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Sparkles,
    Target,
    Users,
    Briefcase,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    Plus
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface Question {
    id: string;
    question: string;
    field: string;
    options: string[];
}

const QUESTIONS: Question[] = [
    {
        id: "category",
        question: "What's the industry or category of your startup?",
        field: "startup_category",
        options: ["SaaS", "E-commerce", "Fintech", "Healthtech", "Edtech", "Artificial Intelligence", "Marketplace"],
    },
    {
        id: "target",
        question: "Who is your primary target audience?",
        field: "target_users",
        options: ["B2B Businesses", "Consumers (B2C)", "Developers", "Small Business Owners", "Enterprise Organizations"],
    },
    {
        id: "stage",
        question: "What is the current stage of your project?",
        field: "current_stage",
        options: ["Idea Phase", "MVP in Development", "Launched (Seeking Traction)", "Early Revenue", "Scaling"],
    },
    {
        id: "model",
        question: "What's your primary business model?",
        field: "business_model_type",
        options: ["Subscription / SaaS", "Transaction Fees", "Marketplace Commission", "Freemium", "Direct Sales"],
    },
    {
        id: "team",
        question: "How is your team structured?",
        field: "team_size",
        options: ["Solo Founder", "Small Core Team (2-4)", "Expanding Team (5-10)", "Established (>10)"],
    },
    {
        id: "funding",
        question: "What's your current resource/funding status?",
        field: "funding_status",
        options: ["Bootstrapped", "Pre-seed / F&F", "Seed Funded", "VC Funded (Series A+)", "Looking for Investment"],
    },
];

export default function ArchitectPage() {
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [step, setStep] = useState(0); // 0: Idea, 1-6: Questions, 7: Loading/Finished
    const [idea, setIdea] = useState("");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [otherInput, setOtherInput] = useState<string>("");
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [threadId] = useState(uuidv4());

    const currentQuestion = step > 0 && step <= QUESTIONS.length ? QUESTIONS[step - 1] : null;

    const handleIdeaSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!idea.trim()) {
            toast.error("Please provide your startup idea first.");
            return;
        }
        if (!token) {
            toast.error("Authentication Required", {
                description: "Please log in to continue building your startup blueprint.",
                action: {
                    label: "Log in",
                    onClick: () => router.push("/login"),
                },
            });
            return;
        }
        setStep(1);
    };

    const handleNextStep = (answerValue: string) => {
        if (answerValue === "Others") {
            setShowOtherInput(true);
            return;
        }

        const finalValue = answerValue === "Custom" ? otherInput : answerValue;
        if (currentQuestion) {
            setAnswers((prev) => ({ ...prev, [currentQuestion.field]: finalValue }));
        }

        setShowOtherInput(false);
        setOtherInput("");

        if (step < QUESTIONS.length) {
            setStep(step + 1);
        } else {
            submitAnswers({ ...answers, [currentQuestion?.field || ""]: finalValue });
        }
    };

    const submitAnswers = async (finalData: Record<string, string>) => {
        setIsSubmitting(true);
        setStep(QUESTIONS.length + 1);

        try {
            const response = await axios.post("/ai/chat", {
                structuredData: {
                    idea_description: idea,
                    ...finalData,
                },
                threadId: threadId,
            });

            const returnedThreadId = response.data.thread_id || threadId;
            toast.success("Blueprint Engineered!", {
                description: "Your startup strategy is ready for review.",
            });
            router.push(`/history/${returnedThreadId}`);
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error("Strategic connection lost. Please try again.");
            setStep(QUESTIONS.length); // Fallback to last question
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] text-gray-900 font-sans selection:bg-blue-100">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                {/* Progress Bar */}
                {step > 0 && step <= QUESTIONS.length && (
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step {step} of {QUESTIONS.length}</span>
                            <span className="text-xs font-bold text-blue-600">{Math.round((step / QUESTIONS.length) * 100)}% Complete</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-700 ease-out"
                                style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Step 0: The Idea */}
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-4">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Removing the fear of starting</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
                                What are we <br />
                                <span className="text-blue-600 italic">launching</span> today?
                            </h1>
                            <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium">
                                Describe your startup idea in a few sentences. Our swarm will take care of the rest.
                            </p>
                        </div>

                        <form onSubmit={handleIdeaSubmit} className="max-w-2xl mx-auto">
                            <div className="relative group">
                                <textarea
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                    placeholder="Example: A marketplace for sustainable architectural materials with AI-driven carbon footprint tracking..."
                                    className="w-full h-40 p-8 text-xl bg-white border-2 border-gray-100 rounded-[2rem] shadow-2xl shadow-gray-200/50 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-300 font-medium"
                                />
                                <button
                                    type="submit"
                                    className="absolute bottom-6 right-6 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/20"
                                >
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Questions Flow */}
                {step > 0 && step <= QUESTIONS.length && currentQuestion && (
                    <div key={step} className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-10 leading-tight">
                            {currentQuestion.question}
                        </h2>

                        {!showOtherInput ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleNextStep(option)}
                                        className="p-6 text-left bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex items-center justify-between"
                                    >
                                        <span className="text-lg font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{option}</span>
                                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleNextStep("Others")}
                                    className="p-6 text-left bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 transition-all group flex items-center justify-between"
                                >
                                    <span className="text-lg font-bold text-gray-500 group-hover:text-gray-900">Something else...</span>
                                    <Plus className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in zoom-in-95 duration-300">
                                <input
                                    autoFocus
                                    type="text"
                                    value={otherInput}
                                    onChange={(e) => setOtherInput(e.target.value)}
                                    placeholder="Please specify..."
                                    className="w-full p-6 text-xl bg-white border-2 border-blue-500 rounded-2xl outline-none mb-6 shadow-xl shadow-blue-500/5 font-bold"
                                    onKeyDown={(e) => e.key === "Enter" && handleNextStep("Custom")}
                                />
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleNextStep("Custom")}
                                        disabled={!otherInput.trim()}
                                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        Confirm Choice
                                    </button>
                                    <button
                                        onClick={() => setShowOtherInput(false)}
                                        className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {step > QUESTIONS.length && (
                    <div className="text-center py-20 animate-in fade-in duration-1000">
                        <div className="relative inline-block mb-12">
                            <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 animate-pulse" />
                            <div className="relative w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center rotate-12 animate-bounce">
                                <BrainCircuit className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Engineering your Swarm...</h2>
                        <p className="text-lg text-gray-500 font-medium mb-12">Our specialized agents are analyzing market data and generating your strategic roadmap.</p>

                        <div className="max-w-md mx-auto space-y-4">
                            {[
                                "Market Research Agent initializing...",
                                "Competitor Analysis in progress...",
                                "Drafting technical implementation...",
                                "Finalizing financial projections..."
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 1000}ms` }}>
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                                    <span className="text-sm font-bold text-gray-700">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
