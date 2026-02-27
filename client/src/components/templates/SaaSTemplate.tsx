import React from 'react';
import DynamicIcon from '../DynamicIcon';

interface TemplateProps {
    data: any;
    slug: string;
}

const SaaSTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { brandName, hero, features, about, pricing, testimonials, theme } = data;
    const primaryColor = theme?.primaryColor || '#3B82F6';

    return (
        <div className={`min-h-screen bg-black text-white font-sans ${theme?.mode === 'light' ? 'bg-white text-black' : ''}`}>
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    {brandName}
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium">
                    <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
                    <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
                    <a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a>
                </div>
                <button className="px-6 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-all">
                    {hero?.cta}
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-8 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
                    <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                        {hero?.title}
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        {hero?.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-blue-600/20">
                            {hero?.cta}
                        </button>
                        <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-colors">
                            {hero?.secondaryCta}
                        </button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 px-8 bg-white/5">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-16 text-center">Built for performance</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features?.map((f: any, i: number) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <DynamicIcon name={f.icon} className="text-blue-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                                <p className="text-gray-400">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About */}
            <section id="about" className="py-20 px-8">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-12 rounded-3xl border border-white/10">
                    <h2 className="text-4xl font-bold mb-6">{about?.title}</h2>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        {about?.content}
                    </p>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-16">Simple Pricing</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {pricing?.map((p: any, i: number) => (
                            <div key={i} className={`p-8 rounded-2xl ${i === 1 ? 'bg-blue-600 scale-105 shadow-2xl shadow-blue-600/30' : 'bg-white/5 border border-white/10'}`}>
                                <h3 className="text-2xl font-bold mb-2">{p.plan}</h3>
                                <div className="text-4xl font-black mb-6">{p.price}</div>
                                <ul className="text-left space-y-4 mb-8">
                                    {p.features?.map((feat: string, j: number) => (
                                        <li key={j} className="flex items-center gap-2">
                                            <DynamicIcon name="CheckCircle2" className={i === 1 ? 'text-white' : 'text-blue-400'} size={18} />
                                            <span className={i === 1 ? 'text-blue-50' : 'text-gray-300'}>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-lg font-bold transition-transform hover:scale-105 ${i === 1 ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                                    Get Started
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials?.map((t: any, i: number) => (
                            <div key={i} className="p-6 rounded-2xl border border-white/5 italic text-gray-400">
                                "{t.content}"
                                <div className="mt-4 not-italic font-bold text-white flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center text-[10px]">AI</div>
                                    <div>
                                        <div>{t.name}</div>
                                        <div className="text-xs text-gray-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-8 border-t border-white/10 mt-20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-2xl font-bold">{brandName}</div>
                    <div className="text-gray-500 text-sm italic">
                        Built with Startup-Swarm AI
                    </div>
                    <div className="text-gray-400">
                        {data.contact?.email}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SaaSTemplate;
