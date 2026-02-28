"use client";

import React, { useState } from "react";
import { Check, Loader2, Sparkles, Building2, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

// Declaring Razorpay on Window
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string>("free");
    const [isFetchingPlan, setIsFetchingPlan] = useState(true);
    const router = useRouter();

    React.useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await axiosInstance.get("/subscriptions/me");
                setCurrentPlan(res.data.plan || "free");
            } catch (error) {
                // Not logged in or error, default to free
            } finally {
                setIsFetchingPlan(false);
            }
        };
        fetchPlan();
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async (planId: "pro" | "pro_plus") => {
        setLoadingPlan(planId);
        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error("Failed to load payment gateway.");
                setLoadingPlan(null);
                return;
            }

            // Create Order
            const orderRes = await axiosInstance.post("/subscriptions/create-order", { planId });
            const { orderId, amount, currency, keyId } = orderRes.data;

            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: "Startup Swarm",
                description: `Upgrade to ${planId.toUpperCase()} Plan`,
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        await axiosInstance.post("/subscriptions/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: planId
                        });

                        toast.success(`Successfully upgraded to ${planId.toUpperCase()}! 🎉`);
                        setCurrentPlan(planId);
                        router.push("/");
                    } catch (err: any) {
                        toast.error(err.response?.data?.error || "Payment verification failed.");
                    }
                },
                theme: {
                    color: "#0F172A",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error("Please login to upgrade.");
                router.push("/login");
            } else {
                toast.error("An error occurred during payment init.");
            }
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,#F8FAFC_0%,#E6ECF5_50%,#DDE5F0_100%)]">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Scale Your Swarm</h1>
                    <p className="text-slate-600 text-lg">
                        Choose the ideal architecture to construct your startup empire. Transparent pricing, no hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* FREE TIER */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl flex flex-col items-center text-center">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Hobby</h3>
                            <div className="text-4xl font-black text-slate-900">₹0<span className="text-lg font-medium text-slate-500">/mo</span></div>
                        </div>
                        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                            Perfect for exploring ideas and testing the swarm's architecture capabilities.
                        </p>
                        <button className="w-full py-3.5 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl outline-none" disabled>
                            {currentPlan === "free" ? "Current Plan" : "Included"}
                        </button>

                        <div className="w-full mt-8 border-t border-slate-200/60 pt-6">
                            <ul className="space-y-4 text-sm text-slate-700 text-left cursor-default">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> 1 Startup per month</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Standard AI Blueprints</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Static Website Export</li>
                                <li className="flex items-center gap-3 text-slate-400"><Check className="w-4 h-4 opacity-30" /> Daily Newsletter AI</li>
                                <li className="flex items-center gap-3 text-slate-400"><Check className="w-4 h-4 opacity-30" /> Autonomous Instagram Post</li>
                            </ul>
                        </div>
                    </div>

                    {/* PRO TIER */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative transform md:-translate-y-4 flex flex-col items-center text-center">
                        <div className="absolute top-0 transform -translate-y-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                            Most Popular
                        </div>
                        <div className="mb-6 mt-4">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-400" /> Professional
                            </h3>
                            <div className="text-4xl font-black text-white">₹149<span className="text-lg font-medium text-slate-400">/mo</span></div>
                        </div>
                        <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                            For dedicated serial entrepreneurs executing multiple domains simultaneously.
                        </p>
                        <button
                            onClick={() => handleSubscribe('pro')}
                            disabled={loadingPlan !== null || currentPlan === 'pro' || currentPlan === 'pro_plus'}
                            className="w-full py-3.5 px-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors outline-none focus:ring-4 focus:ring-blue-500/20 flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:text-slate-400"
                        >
                            {loadingPlan === "pro" ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                currentPlan === "pro" ? "Current Plan" :
                                    currentPlan === "pro_plus" ? "Included in Pro+" : "Deploy Architect Pro"}
                        </button>

                        <div className="w-full mt-8 border-t border-slate-700 pt-6">
                            <ul className="space-y-4 text-sm text-slate-200 text-left">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> 3 Startups per month</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Advanced Roadmap & Strategies</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Interactive SaaS Generation</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Daily Executive Email Newsletter</li>
                                <li className="flex items-center gap-3 text-slate-500"><Check className="w-4 h-4 opacity-30" /> Autonomous Instagram Post</li>
                            </ul>
                        </div>
                    </div>

                    {/* PRO PLUS TIER */}
                    <div className="bg-gradient-to-br from-fuchsia-600 to-pink-600 rounded-3xl p-8 shadow-2xl relative flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 p-32 -translate-y-1/2 translate-x-1/2 bg-white/10 rounded-full blur-3xl opacity-50"></div>
                        <div className="mb-6 relative z-10">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 text-pink-200" /> Pro Plus
                            </h3>
                            <div className="text-4xl font-black text-white">₹249<span className="text-lg font-medium text-fuchsia-200">/mo</span></div>
                        </div>
                        <p className="text-fuchsia-100 text-sm mb-8 leading-relaxed relative z-10">
                            Full autonomous studio. Let the AI literally market the business on social media for you.
                        </p>
                        <button
                            onClick={() => handleSubscribe('pro_plus')}
                            disabled={loadingPlan !== null || currentPlan === 'pro_plus'}
                            className="w-full py-3.5 px-4 bg-white text-pink-600 hover:bg-pink-50 font-black rounded-xl transition-transform active:scale-95 outline-none relative z-10 flex items-center justify-center gap-2 disabled:bg-white/50 disabled:text-pink-600/50 disabled:active:scale-100"
                        >
                            {loadingPlan === "pro_plus" ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                currentPlan === "pro_plus" ? "Current Plan" : "Unlock the Swarm"}
                        </button>

                        <div className="w-full mt-8 border-t border-white/20 pt-6 relative z-10">
                            <ul className="space-y-4 text-sm text-white text-left font-medium">
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-pink-200" /> 5 Startups per month</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-pink-200" /> Priority Model Inference (Llama 70b)</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-pink-200" /> Access to 12 Next.js Templates</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-pink-200" /> Daily Executive Email Newsletter</li>
                                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-pink-200" /> Autonomous Instagram Post Agent</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
