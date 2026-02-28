"use client";

import Link from "next/link";
import { BrainCircuit, ChevronDown, ArrowRight, Menu, User, History, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { token, user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        dispatch(logout());
    };

    const getEmailPrefix = (email: string) => {
        return email.split("@")[0];
    };

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-6 ${scrolled ? "pt-3" : "pt-5"}`}>
            <nav
                className={`
          max-w-7xl mx-auto rounded-full transition-all duration-500 flex items-center px-4 md:px-6
          ${scrolled
                        ? "h-14 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-white/40"
                        : "h-16 bg-white/40 backdrop-blur-md border border-white/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] ring-1 ring-white/20"
                    }
        `}
            >
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center transition-all group-hover:rotate-6 group-hover:scale-105 duration-300 shadow-sm">
                                <BrainCircuit className="w-4.5 h-4.5 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight hidden sm:block text-gray-900">Swarm</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-600">
                            <Link href="/pricing" className="px-4 py-1.5 rounded-full hover:bg-gray-900/5 hover:text-gray-900 transition-all">
                                Pricing
                            </Link>
                            {[
                                { name: "Solutions", hasMenu: true },
                                { name: "Platform", hasMenu: true },
                                { name: "Resources", hasMenu: true },
                            ].map((item) => (
                                <a
                                    key={item.name}
                                    href="#"
                                    className="px-4 py-1.5 rounded-full hover:bg-gray-900/5 hover:text-gray-900 transition-all flex items-center gap-1 group"
                                >
                                    {item.name}
                                    {item.hasMenu && (
                                        <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover:translate-y-0.5 transition-transform group-hover:opacity-70" />
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!mounted ? null : token && user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-gray-900 font-semibold text-xs md:text-sm">
                                        {getEmailPrefix(user.email)}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform opacity-50 ${isProfileOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-1.5">
                                            <Link
                                                href="/history"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                                            >
                                                <History className="w-4 h-4 opacity-70" />
                                                <span className="text-sm font-medium">My History</span>
                                            </Link>
                                            <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsProfileOpen(false);
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 opacity-70" />
                                                <span className="text-sm font-medium">Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    Log in
                                </Link>
                                <Link href="/architect">
                                    <button className="group relative inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full transition-all hover:bg-black active:scale-[0.98] shadow-lg shadow-gray-200">
                                        <span>Get Started</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                </Link>
                            </div>
                        )}

                        <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Subtle bottom shine effect */}
            <div
                className={`max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent transition-opacity duration-700 ${scrolled ? "opacity-100" : "opacity-0"
                    }`}
            />
        </div>
    );
}
