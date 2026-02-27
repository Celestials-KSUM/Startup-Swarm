import React from 'react';
import DynamicIcon from '../DynamicIcon';

interface TemplateProps {
    data: any;
    slug: string;
}

const ServiceTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { brandName, hero, features, about, contact, theme } = data;

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
            {/* Header */}
            <header className="px-8 py-6 flex justify-between items-center bg-white shadow-sm sticky top-0 z-50">
                <div className="text-2xl font-black tracking-tighter text-blue-700">{brandName}</div>
                <div className="flex gap-6 items-center">
                    <a href="#services" className="font-semibold text-neutral-600 hover:text-blue-700">Services</a>
                    <a href="#contact" className="px-5 py-2 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors">
                        Book Now
                    </a>
                </div>
            </header>

            {/* Hero */}
            <section className="py-24 px-8 bg-blue-700 text-white">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                        {hero?.title}
                    </h1>
                    <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-2xl">
                        {hero?.subtitle}
                    </p>
                    <button className="px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:shadow-2xl transition-all">
                        {hero?.cta}
                    </button>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="py-24 px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4 text-center">Expert Solutions</h2>
                    <p className="text-neutral-500 text-center mb-16 max-w-2xl mx-auto">
                        Tailored services designed to help you achieve your goals with precision and excellence.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features?.map((f: any, i: number) => (
                            <div key={i} className="p-8 bg-white rounded-3xl shadow-xl shadow-neutral-200/50 hover:-translate-y-2 transition-transform border border-neutral-100">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                                    <DynamicIcon name={f.icon} className="text-blue-700" size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-neutral-600 leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="py-24 px-8 bg-neutral-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-700/10 skew-x-12 translate-x-32" />
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-8">{about?.title}</h2>
                        <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                            {about?.content}
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-4xl font-bold text-blue-400">100+</div>
                                <div className="text-sm text-neutral-500 uppercase tracking-widest mt-1">Happy Clients</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-400">99%</div>
                                <div className="text-sm text-neutral-500 uppercase tracking-widest mt-1">Success Rate</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative aspect-square bg-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <DynamicIcon name="Sparkles" className="text-blue-700/50" size={120} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="py-24 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-1/2 p-12 bg-blue-700 text-white">
                            <h2 className="text-4xl font-bold mb-8">Ready to start?</h2>
                            <p className="mb-12 text-blue-100">Reach out to us today and let's discuss how we can help your business grow.</p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <DynamicIcon name="Mail" size={24} />
                                    <span>{contact?.email}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <DynamicIcon name="Phone" size={24} />
                                    <span>{contact?.phone}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <DynamicIcon name="MapPin" size={24} />
                                    <span>{contact?.address}</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2 p-12">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-xl bg-neutral-100 border-none focus:ring-2 focus:ring-blue-700" />
                                    <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-neutral-100 border-none focus:ring-2 focus:ring-blue-700" />
                                </div>
                                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-neutral-100 border-none focus:ring-2 focus:ring-blue-700" />
                                <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-xl bg-neutral-100 border-none focus:ring-2 focus:ring-blue-700"></textarea>
                                <button className="w-full py-4 bg-neutral-900 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 text-center text-neutral-500 border-t border-neutral-200 bg-white">
                <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ServiceTemplate;
