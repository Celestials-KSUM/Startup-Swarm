"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Navbar from "@/components/Navbar";
import axiosInstance from "@/lib/axios";
import { Clock, Loader2, Target, ArrowRight } from "lucide-react";

export default function HistoryPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get("/ai/my-history");
                setAnalyses(res.data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token, router]);

    const getPreviewText = (input: unknown) => {
        if (!input) return "Unknown Idea";
        if (typeof input === "string") {
            return input.length > 60 ? input.substring(0, 60) + "..." : input;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const objInput = input as Record<string, any>;
        if (objInput.name) return objInput.name;
        if (objInput.businessIdea) return objInput.businessIdea;
        return "Complex Idea";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-28 md:py-36">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-4 mb-4">
                        <Clock className="w-10 h-10 text-blue-600" />
                        My Startup Blueprints
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto md:mx-0">
                        Review your past startup ideas and generated blueprints.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium text-lg">Loading your history...</p>
                    </div>
                ) : analyses.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Target className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No blueprints yet</h2>
                        <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
                            You haven&apos;t generated any startup blueprints yet. Head back to the architect to create your first one.
                        </p>
                        <button
                            onClick={() => router.push("/architect")}
                            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Start Building Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analyses.map((analysis) => {
                            const data = analysis.data?.businessOverview || {};
                            return (
                                <div
                                    key={analysis.id}
                                    onClick={() => router.push(`/history/${analysis.thread_id}`)}
                                    className="group relative bg-white border border-gray-200 rounded-3xl p-6 cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                            Blueprint
                                        </div>
                                        <span className="text-sm font-medium text-gray-400">
                                            {new Date(analysis.created_at || Date.now()).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {data.name || "Unnamed Startup"}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {data.description || getPreviewText(analysis.input_data)}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-tight">Thread ID</span>
                                            <span className="text-sm font-mono text-gray-600 truncate max-w-[120px]" title={analysis.thread_id}>
                                                {analysis.thread_id.split('-')[0]}...
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
