import React from 'react';
import DynamicIcon from '../DynamicIcon';

interface TemplateProps {
    data: any;
    slug: string;
}

const CorporateTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { brandName, hero, features, contact, about, testimonials } = data;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Search Header */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-12 py-5 flex justify-between items-center">
                <div className="flex items-center gap-12">
                    <div className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{brandName}<span className="text-blue-600">.</span></div>
                    <div className="hidden lg:flex gap-8 text-sm font-bold text-slate-700">
                        <a href="#vision" className="hover:text-blue-600 transition-colors">Vision</a>
                        <a href="#capabilities" className="hover:text-blue-600 transition-colors">Capabilities</a>
                        <a href="#leadership" className="hover:text-blue-600 transition-colors">Leadership</a>
                        <a href="#investors" className="hover:text-blue-600 transition-colors">Investors</a>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-sm hover:bg-slate-800 transition-all">
                        Contact Strategy
                    </button>
                </div>
            </nav>

            <section className="pt-40 pb-20 px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
                    <div className="md:w-1/2">
                        <div className="w-12 h-1 bg-blue-600 mb-8" />
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-900 mb-8 leading-[0.9]">
                            {hero?.title}
                        </h1>
                        <p className="text-xl text-slate-600 mb-12 max-w-lg leading-relaxed font-medium">
                            {hero?.subtitle}
                        </p>
                        <div className="flex gap-6">
                            <button className="px-8 py-4 bg-blue-600 text-white font-bold tracking-tight rounded-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                                {hero?.cta}
                            </button>
                            <button className="px-8 py-4 border-2 border-slate-900 text-slate-900 font-bold tracking-tight rounded-sm hover:bg-slate-900 hover:text-white transition-all">
                                Annual Report
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative">
                        <div className="aspect-[4/5] bg-slate-200 rounded-sm overflow-hidden shadow-2xl relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <DynamicIcon name="Building2" className="text-slate-100 opacity-20" size={200} />
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 bg-white p-10 shadow-2xl border border-slate-100 hidden lg:block">
                            <div className="text-5xl font-black text-blue-600 mb-2">25+</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Markets</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="vision" className="py-32 px-12 bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-sm font-bold text-blue-400 uppercase tracking-[0.4em] mb-12 text-center">Executive Summary</h2>
                    <blockquote className="text-4xl md:text-5xl font-medium leading-tight text-center italic mb-12">
                        "{about?.content}"
                    </blockquote>
                    <div className="flex justify-center items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800" />
                        <div>
                            <div className="font-bold">{about?.title}</div>
                            <div className="text-slate-500 text-sm">Strategic Governance Board</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="capabilities" className="py-32 px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-20">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Strategic<br />Capabilities.</h2>
                        <p className="max-w-md text-slate-500 font-medium">Leveraging advanced intelligence and operational excellence to drive sustained market leadership.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
                        {features?.map((f: any, i: number) => (
                            <div key={i} className="bg-white p-12 hover:bg-blue-50 transition-colors group">
                                <DynamicIcon name={f.icon} className="text-blue-600 mb-8" size={32} />
                                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-32 px-12 bg-slate-100">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-black mb-16 text-center uppercase tracking-widest">Performance Metrics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        <div>
                            <div className="text-6xl font-black text-slate-900 mb-2">12B</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">AUM</div>
                        </div>
                        <div>
                            <div className="text-6xl font-black text-slate-900 mb-2">94%</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retention</div>
                        </div>
                        <div>
                            <div className="text-6xl font-black text-slate-900 mb-2">400+</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Partners</div>
                        </div>
                        <div>
                            <div className="text-6xl font-black text-slate-900 mb-2">15</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Offices</div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-20 px-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between gap-12 mb-20">
                        <div>
                            <div className="text-2xl font-black mb-8 uppercase tracking-tighter">{brandName}<span className="text-blue-600">.</span></div>
                            <p className="text-slate-500 max-w-xs text-sm">Empowering global enterprise through innovative data architecture and strategic foresight.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                            <div className="space-y-6">
                                <h4 className="font-black text-xs uppercase tracking-widest">Legal</h4>
                                <ul className="text-slate-500 text-sm space-y-4 font-medium italic">
                                    <li>Privacy Policy</li>
                                    <li>Terms of Service</li>
                                    <li>Accessibility</li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="font-black text-xs uppercase tracking-widest">Investor Relations</h4>
                                <ul className="text-slate-500 text-sm space-y-4 font-medium italic">
                                    <li>Quarterly Earnings</li>
                                    <li>Stock Information</li>
                                    <li>Sustainability</li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="font-black text-xs uppercase tracking-widest">Global</h4>
                                <div className="text-slate-500 text-sm leading-relaxed italic">
                                    {contact?.address}<br />
                                    {contact?.phone}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <div>&copy; {new Date().getFullYear()} {brandName} International Group</div>
                        <div className="flex gap-8 mt-4 sm:mt-0 italic">
                            <span>NYSE: {brandName.slice(0, 3).toUpperCase()}</span>
                            <span>GDPR Compliant</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CorporateTemplate;
