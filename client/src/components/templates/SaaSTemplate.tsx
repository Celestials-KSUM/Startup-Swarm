import React from 'react';
import DynamicIcon from '../DynamicIcon';

interface TemplateProps {
    data: any;
    slug: string;
}

const SaaSTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { brandName, hero, features, about, pricing, testimonials, theme } = data;
    const isLight = theme?.mode === 'light';

    const bgClass = isLight ? "bg-slate-50 text-slate-900" : "bg-[#0B0F19] text-white";
    const glassNav = isLight ? "bg-white/70 border-slate-200" : "bg-[#0B0F19]/70 border-white/10";
    const glassCard = isLight ? "bg-white border-slate-200 shadow-xl shadow-slate-200/50" : "bg-[#1A1F2E]/60 border-white/5 hover:border-white/10 shadow-2xl";
    const textGray = isLight ? "text-slate-600" : "text-gray-400";
    const textHeading = isLight ? "text-slate-900" : "text-white";

    return (
        <div className={`min-h-screen font-sans selection:bg-indigo-500/30 ${bgClass} overflow-x-hidden relative`}>

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b ${glassNav} transition-all duration-300`}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-bold text-xl">{brandName?.[0] || 'S'}</span>
                        </div>
                        <span className={`text-2xl font-black tracking-tight ${textHeading}`}>
                            {brandName}
                        </span>
                    </div>

                    <div className="hidden md:flex gap-8 items-center text-sm font-semibold">
                        {['Features', 'About', 'Pricing'].map(item => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className={`${textGray} hover:text-indigo-500 transition-colors duration-200 cursor-pointer`}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex gap-4 items-center">
                        <a href="#pricing" className={`hidden sm:block text-sm font-semibold ${textGray} hover:${textHeading} transition-colors`}>Log in</a>
                        <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300">
                            {hero?.cta || "Get Started"}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="relative pt-40 md:pt-48 pb-20 md:pb-32 px-6 sm:px-8 flex flex-col items-center justify-center min-h-[90vh]">
                    <div className="max-w-5xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-medium text-sm mb-4 animate-fade-in-up">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            v2.0 is now live
                        </div>

                        <h1 className={`text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.1] ${textHeading} animate-fade-in-up animation-delay-100`}>
                            {hero?.title?.split(' ').map((word: string, i: number) => (
                                i % 3 === 0 ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">{word} </span> : <span key={i}>{word} </span>
                            ))}
                        </h1>

                        <p className={`text-lg sm:text-2xl ${textGray} max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200`}>
                            {hero?.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up animation-delay-300">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group">
                                {hero?.cta || "Start for free"}
                                <DynamicIcon name="ArrowRight" size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className={`w-full sm:w-auto px-8 py-4 rounded-full border ${isLight ? 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50' : 'border-white/10 text-white bg-white/5 hover:bg-white/10'} font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2`}>
                                <DynamicIcon name="PlayCircle" size={20} />
                                {hero?.secondaryCta || "Watch demo"}
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Mockup Component */}
                    <div className="w-full max-w-6xl mx-auto mt-20 animate-fade-in-up animation-delay-500 relative perspective-[2000px]">
                        <div className={`rounded-2xl border ${isLight ? 'border-slate-200 bg-white/80' : 'border-white/10 bg-[#151923]'} backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-x-[5deg] scale-95 origin-bottom transition-transform duration-700 hover:rotate-x-0 hover:scale-100`}>
                            <div className={`h-12 border-b ${isLight ? 'border-slate-200 bg-slate-100/50' : 'border-white/10 bg-white/5'} flex items-center px-4 gap-2`}>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className={`mx-auto px-32 py-1.5 rounded-md text-xs font-mono opacity-50 ${isLight ? 'bg-white' : 'bg-black/20'}`}>
                                    app.{brandName?.toLowerCase() || 'startup'}.com
                                </div>
                            </div>
                            <div className="h-[400px] md:h-[600px] p-6 md:p-10 object-cover bg-cover bg-center" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)" }}>
                                <div className="grid grid-cols-3 gap-6 h-full">
                                    <div className={`col-span-1 border ${isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-white/5'} rounded-xl p-6 flex flex-col gap-4 animate-pulse`}>
                                        <div className={`w-1/2 h-6 rounded ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}></div>
                                        <div className={`w-3/4 h-4 rounded mt-4 ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}></div>
                                        <div className={`w-full h-24 rounded mt-4 ${isLight ? 'bg-indigo-50' : 'bg-indigo-500/20'} border ${isLight ? 'border-indigo-100' : 'border-indigo-500/30'}`}></div>
                                        <div className={`w-full h-24 rounded mt-4 ${isLight ? 'bg-purple-50' : 'bg-purple-500/20'} border ${isLight ? 'border-purple-100' : 'border-purple-500/30'}`}></div>
                                    </div>
                                    <div className={`col-span-2 border ${isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-white/5'} rounded-xl p-6 flex flex-col gap-4`}>
                                        <div className="flex justify-between items-center mb-8">
                                            <div className={`w-1/3 h-8 rounded ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}></div>
                                            <div className={`w-1/4 h-8 rounded-full ${isLight ? 'bg-indigo-100' : 'bg-indigo-500/20'}`}></div>
                                        </div>
                                        <div className="flex-1 flex items-end gap-4">
                                            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                                                <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500 to-purple-500 relative group cursor-pointer transition-all hover:brightness-125" style={{ height: `${h}%` }}>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-bold py-1 px-2 rounded bg-white text-black transition-opacity">
                                                        {h}k
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="py-24 px-6 sm:px-8 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-indigo-500 font-bold uppercase tracking-wider text-sm mb-3">Powerful Features</h2>
                            <h3 className={`text-4xl md:text-5xl font-black ${textHeading}`}>Everything you need to scale</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                            {features?.map((f: any, i: number) => {
                                const isWide = i === 0 || i === 3;
                                return (
                                    <div
                                        key={i}
                                        className={`p-8 rounded-3xl ${glassCard} border ${isLight ? 'border-slate-200' : 'border-white/5'} backdrop-blur-md group relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${isWide ? 'md:col-span-2' : 'md:col-span-1'}`}
                                    >
                                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className="relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${isLight ? 'bg-indigo-50 text-indigo-600 shadow-indigo-100' : 'bg-indigo-500/20 text-indigo-400 shadow-indigo-500/10'}`}>
                                                <DynamicIcon name={f.icon} size={28} />
                                            </div>
                                            <h4 className={`text-2xl font-bold mb-3 ${textHeading}`}>{f.title}</h4>
                                            <p className={`${textGray} text-lg leading-relaxed`}>{f.description}</p>
                                        </div>

                                        {isWide && (
                                            <div className="mt-8 flex items-center text-indigo-500 font-semibold group/btn w-fit cursor-pointer relative z-10">
                                                Explore capability
                                                <DynamicIcon name="ArrowRight" size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-24 px-6 sm:px-8 relative overflow-hidden">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className={`max-w-7xl mx-auto rounded-3xl ${glassCard} border ${isLight ? 'border-transparent bg-gradient-to-br from-indigo-50 to-purple-50' : 'border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]'} p-10 md:p-20 relative overflow-hidden`}>
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6">
                                <h2 className="text-indigo-500 font-bold uppercase tracking-wider text-sm">About Us</h2>
                                <h3 className={`text-4xl md:text-5xl font-black leading-tight ${textHeading}`}>{about?.title || "Reimagining the future"}</h3>
                                <p className={`text-xl ${textGray} leading-relaxed`}>
                                    {about?.content}
                                </p>
                                <div className="pt-4 flex gap-8">
                                    <div>
                                        <div className={`text-3xl font-black ${textHeading}`}>99.9%</div>
                                        <div className={`text-sm ${textGray} font-medium mt-1`}>Uptime SLA</div>
                                    </div>
                                    <div>
                                        <div className={`text-3xl font-black ${textHeading}`}>24/7</div>
                                        <div className={`text-sm ${textGray} font-medium mt-1`}>Support included</div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-full min-h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-tr from-indigo-900/50 to-purple-900/50 flex items-center justify-center p-8">
                                <div className="w-full h-full border border-white/20 rounded-xl relative overflow-hidden backdrop-blur-sm">
                                    <div className="absolute inset-1 rounded-lg bg-[#0B0F19]/90"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <DynamicIcon name="Box" size={80} className={`opacity-80 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 px-6 sm:px-8 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-indigo-500 font-bold uppercase tracking-wider text-sm mb-3">Pricing</h2>
                            <h3 className={`text-4xl md:text-5xl font-black ${textHeading}`}>Transparent plans for everyone</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end">
                            {pricing?.map((p: any, i: number) => {
                                const isPopular = i === 1;
                                return (
                                    <div
                                        key={i}
                                        className={`relative rounded-3xl flex flex-col p-8 transition-transform duration-300 hover:-translate-y-2
                                            ${isPopular
                                                ? 'bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 transform md:-translate-y-4'
                                                : `border ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/[0.02]'} ${glassCard}`
                                            }
                                        `}
                                    >
                                        {isPopular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 font-bold px-4 py-1 rounded-full text-sm shadow-lg">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="mb-8">
                                            <h4 className={`text-xl font-bold mb-2 ${isPopular ? 'text-indigo-100' : textHeading}`}>{p.plan}</h4>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-4xl sm:text-5xl font-black ${isPopular ? 'text-white' : textHeading}`}>{p.price}</span>
                                                <span className={isPopular ? 'text-indigo-200' : textGray}>/mo</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-4 mb-8 flex-1">
                                            {p.features?.map((feat: string, j: number) => (
                                                <li key={j} className="flex items-start gap-3 text-sm sm:text-base">
                                                    <div className={`mt-1 shrink-0 ${isPopular ? 'text-white' : 'text-indigo-500'}`}>
                                                        <DynamicIcon name="CheckCircle2" size={18} />
                                                    </div>
                                                    <span className={`${isPopular ? 'text-indigo-50' : textGray}`}>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button className={`w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] 
                                            ${isPopular
                                                ? 'bg-white text-indigo-600 shadow-xl'
                                                : `bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25`
                                            }
                                        `}>
                                            Choose {p.plan}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                {testimonials && testimonials.length > 0 && (
                    <section className="py-24 px-6 sm:px-8 border-t border-white/5 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-1/3 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="max-w-7xl mx-auto">
                            <h3 className={`text-3xl md:text-5xl font-black text-center mb-16 ${textHeading}`}>Loved by builders</h3>

                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                {testimonials.map((t: any, i: number) => (
                                    <div key={i} className={`break-inside-avoid p-8 rounded-2xl ${glassCard} border ${isLight ? 'border-slate-200' : 'border-white/5'} transition-all hover:border-indigo-500/50`}>
                                        <div className="flex gap-1 mb-6 text-amber-400">
                                            {[...Array(5)].map((_, j) => <DynamicIcon key={j} name="Star" size={16} className="fill-current" />)}
                                        </div>
                                        <p className={`text-lg ${textHeading} leading-relaxed mb-8 italic`}>
                                            "{t.content}"
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${textHeading}`}>{t.name}</div>
                                                <div className={`text-sm ${textGray}`}>{t.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Call to Action Footer Pre-amble */}
                <section className="py-24 px-6 sm:px-8 relative z-10">
                    <div className="max-w-5xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-20 shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10">Ready to get started?</h2>
                        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto relative z-10">Join thousands of users and start building your future today with our powerful tools.</p>
                        <button className="relative z-10 px-8 py-4 rounded-full bg-white text-indigo-600 font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            {hero?.cta || "Sign up for free"}
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className={`relative z-10 border-t ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-[#0B0F19]'} pt-20 pb-10 px-6 sm:px-8`}>
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{brandName?.[0] || 'S'}</span>
                            </div>
                            <span className={`text-xl font-bold tracking-tight ${textHeading}`}>{brandName}</span>
                        </div>
                        <p className={`${textGray} max-w-sm leading-relaxed mb-6`}>
                            {hero?.subtitle?.substring(0, 100) || "Making work beautiful."}
                        </p>
                        <div className="flex gap-4">
                            {['Twitter', 'Github', 'Linkedin'].map(icon => (
                                <a key={icon} href="#" className={`w-10 h-10 rounded-full border ${isLight ? 'border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-600' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'} flex items-center justify-center transition-all`}>
                                    <DynamicIcon name={icon as any} size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className={`font-bold mb-6 ${textHeading}`}>Product</h4>
                        <ul className="space-y-4 text-sm">
                            {['Features', 'Integrations', 'Pricing', 'Changelog'].map(item => (
                                <li key={item}><a href="#" className={`${textGray} hover:text-indigo-500 transition-colors`}>{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className={`font-bold mb-6 ${textHeading}`}>Company</h4>
                        <ul className="space-y-4 text-sm">
                            {['About Us', 'Careers', 'Blog', 'Contact'].map(item => (
                                <li key={item}><a href="#" className={`${textGray} hover:text-indigo-500 transition-colors`}>{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className={`font-bold mb-6 ${textHeading}`}>Legal</h4>
                        <ul className="space-y-4 text-sm">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                                <li key={item}><a href="#" className={`${textGray} hover:text-indigo-500 transition-colors`}>{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={`max-w-7xl mx-auto pt-8 border-t ${isLight ? 'border-slate-200' : 'border-white/10'} flex flex-col md:flex-row justify-between items-center gap-4`}>
                    <div className={`text-sm ${textGray}`}>
                        © {new Date().getFullYear()} {brandName}. All rights reserved.
                    </div>
                    <div className={`text-sm ${textGray} flex items-center gap-2`}>
                        <DynamicIcon name="Box" size={14} /> Built with Startup Swarm {` `}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SaaSTemplate;
