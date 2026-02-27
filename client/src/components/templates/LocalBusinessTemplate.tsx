import React from 'react';
import DynamicIcon from '../DynamicIcon';

interface TemplateProps {
    data: any;
    slug: string;
}

const LocalBusinessTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { brandName, hero, features, contact, about } = data;

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-serif">
            {/* Top Bar */}
            <div className="bg-stone-900 text-stone-300 py-2 px-8 text-sm flex justify-between">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><DynamicIcon name="Clock" size={14} /> Open 9:00 AM - 6:00 PM</span>
                    <span className="flex items-center gap-1"><DynamicIcon name="Phone" size={14} /> {contact?.phone}</span>
                </div>
                <div className="hidden sm:block">Visit our {contact?.address} location</div>
            </div>

            <nav className="p-8 flex justify-between items-center border-b border-stone-200 bg-white">
                <div className="text-3xl font-bold tracking-widest uppercase">{brandName}</div>
                <div className="flex gap-8 items-center font-sans uppercase text-xs tracking-[0.2em] font-bold">
                    <a href="#about">Our Story</a>
                    <a href="#services">Services</a>
                    <a href="#contact">Find Us</a>
                    <button className="px-6 py-3 border border-stone-900 hover:bg-stone-900 hover:text-white transition-all">
                        Inquiry
                    </button>
                </div>
            </nav>

            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
                    <DynamicIcon name="Warehouse" className="text-stone-300 opacity-50" size={300} />
                </div>
                <div className="relative z-10 text-center max-w-3xl px-8">
                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none italic uppercase">
                        {hero?.title}
                    </h1>
                    <p className="text-xl font-sans mb-12 text-stone-700 uppercase tracking-[0.1em]">
                        {hero?.subtitle}
                    </p>
                    <button className="px-10 py-5 bg-stone-900 text-white font-sans font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
                        {hero?.cta}
                    </button>
                </div>
            </section>

            <section id="services" className="py-24 px-8 border-b border-stone-200">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16">
                    {features?.map((f: any, i: number) => (
                        <div key={i} className="text-center">
                            <div className="mb-8 flex justify-center">
                                <DynamicIcon name={f.icon} size={48} strokeWidth={1} className="text-stone-900" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 uppercase tracking-tighter italic">{f.title}</h3>
                            <p className="font-sans text-stone-600 leading-relaxed italic">{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="about" className="py-24 px-8 bg-stone-100">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-8 uppercase italic">{about?.title}</h2>
                    <p className="text-2xl leading-relaxed text-stone-700 mb-12 italic">
                        "{about?.content}"
                    </p>
                    <div className="h-px w-24 bg-stone-900 mx-auto" />
                </div>
            </section>

            <section id="contact" className="py-24 px-8 grid md:grid-cols-2 gap-px bg-stone-200">
                <div className="bg-white p-16">
                    <h2 className="text-4xl font-bold mb-8 uppercase italic">Get In Touch</h2>
                    <div className="space-y-8 font-sans">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-widest text-stone-400">Location</label>
                            <p className="text-xl italic">{contact?.address}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-widest text-stone-400">Email</label>
                            <p className="text-xl italic">{contact?.email}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-widest text-stone-400">Reservations</label>
                            <p className="text-xl italic">{contact?.phone}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-stone-900 p-16 text-white flex flex-col justify-center">
                    <h2 className="text-4xl font-bold mb-8 uppercase italic">Join Our Community</h2>
                    <p className="font-sans mb-8 text-stone-400 italic">Sign up for our newsletter to receive exclusive updates and events.</p>
                    <div className="flex gap-4">
                        <input type="email" placeholder="Email Address" className="flex-1 bg-white/5 border border-white/10 px-4 py-3 font-sans italic" />
                        <button className="bg-white text-stone-900 px-8 py-3 font-sans font-bold uppercase hover:bg-stone-200 transition-all">Submit</button>
                    </div>
                </div>
            </section>

            <footer className="py-12 px-8 text-center text-stone-400 text-xs font-sans uppercase tracking-widest">
                &copy; {new Date().getFullYear()} {brandName} &mdash; Handcrafted Presence
            </footer>
        </div>
    );
};

export default LocalBusinessTemplate;
