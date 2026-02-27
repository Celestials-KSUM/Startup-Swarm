import React from 'react';
import DynamicIcon from '../DynamicIcon';

interface TemplateProps {
    data: any;
    slug: string;
}

const EcommerceTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { brandName, hero, features, contact, about, pricing } = data;

    return (
        <div className="min-h-screen bg-rose-50 text-neutral-900 font-sans">
            {/* Promo Bar */}
            <div className="bg-neutral-900 text-white py-2 text-center text-xs font-bold uppercase tracking-widest">
                Free Shipping on all orders over $100
            </div>

            <nav className="p-8 flex justify-between items-center bg-white sticky top-0 z-50">
                <div className="text-3xl font-black uppercase tracking-tighter text-rose-600">{brandName}</div>
                <div className="hidden md:flex gap-12 text-sm font-bold uppercase tracking-widest">
                    <a href="#shop" className="hover:text-rose-600">Shop</a>
                    <a href="#story" className="hover:text-rose-600">Our Story</a>
                    <a href="#contact" className="hover:text-rose-600">Support</a>
                </div>
                <div className="flex gap-4">
                    <button className="p-2"><DynamicIcon name="Search" size={20} /></button>
                    <button className="p-2 relative">
                        <DynamicIcon name="ShoppingBag" size={20} />
                        <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                    </button>
                </div>
            </nav>

            <section className="relative aspect-[16/9] md:aspect-[21/9] flex items-center bg-neutral-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent z-10" />
                <div className="relative z-20 px-16 max-w-2xl">
                    <span className="text-rose-600 font-bold uppercase tracking-widest text-sm mb-4 block">New Collection 2024</span>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none">
                        {hero?.title}
                    </h1>
                    <p className="text-xl text-neutral-600 mb-10 leading-relaxed font-medium">
                        {hero?.subtitle}
                    </p>
                    <button className="px-10 py-5 bg-neutral-900 text-white font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl">
                        {hero?.cta}
                    </button>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full bg-rose-100 flex items-center justify-center">
                    <DynamicIcon name="Sparkles" className="text-rose-300 transform scale-[5]" size={100} />
                </div>
            </section>

            <section id="shop" className="py-24 px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-black mb-16 uppercase tracking-tighter">Featured Products</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {pricing?.map((p: any, i: number) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[3/4] bg-neutral-100 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center">
                                    <DynamicIcon name="Package" className="text-neutral-300 group-hover:scale-110 transition-transform duration-500" size={60} />
                                    <button className="absolute bottom-4 left-4 right-4 bg-white py-3 rounded-xl font-bold translate-y-20 group-hover:translate-y-0 transition-transform shadow-xl">
                                        Quick Add +
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold mb-1 group-hover:text-rose-600 transition-colors uppercase">{p.plan}</h3>
                                <p className="text-neutral-500 text-sm mb-2">{p.features?.[0]}</p>
                                <div className="text-xl font-black">{p.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="story" className="py-24 px-8 bg-white border-y border-neutral-100">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-12">
                        <DynamicIcon name="Heart" className="text-rose-600" size={32} />
                    </div>
                    <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">{about?.title}</h2>
                    <p className="text-2xl leading-relaxed text-neutral-600 italic">
                        "{about?.content}"
                    </p>
                </div>
            </section>

            <section className="py-24 px-8 bg-neutral-50">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
                    {features?.map((f: any, i: number) => (
                        <div key={i} className="flex gap-6 items-start">
                            <div className="p-4 bg-white rounded-2xl shadow-sm">
                                <DynamicIcon name={f.icon} className="text-rose-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-2 uppercase text-sm tracking-widest">{f.title}</h3>
                                <p className="text-neutral-500 text-sm italic">{f.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="py-24 px-8 bg-neutral-900 text-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
                    <div className="col-span-2">
                        <div className="text-3xl font-black mb-8 uppercase tracking-tighter text-rose-500">{brandName}</div>
                        <p className="text-neutral-400 max-w-sm leading-relaxed mb-8 italic">
                            Redefining quality and style through AI-driven design and sustainable practices. Joining the future of commerce.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><DynamicIcon name="Instagram" size={18} /></div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><DynamicIcon name="Twitter" size={18} /></div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><DynamicIcon name="Facebook" size={18} /></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-8 uppercase tracking-[0.2em] text-xs">Navigation</h4>
                        <ul className="space-y-4 text-neutral-400 text-sm font-medium">
                            <li>Shop All</li>
                            <li>Best Sellers</li>
                            <li>About Us</li>
                            <li>Returns Policy</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-8 uppercase tracking-[0.2em] text-xs">Contact</h4>
                        <p className="text-neutral-400 text-sm mb-4 italic">{contact?.address}</p>
                        <p className="text-neutral-400 text-sm italic">{contact?.email}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default EcommerceTemplate;
