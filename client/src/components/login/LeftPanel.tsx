import dynamic from 'next/dynamic';
import { UsersIcon, LogoMark } from './Icons';

const ParticleScene = dynamic(() => import('./ParticleScene'), { ssr: false });

export default function LeftPanel() {
    return (
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden
      bg-[radial-gradient(ellipse_at_60%_40%,#e8edf8_0%,#dce4f2_40%,#cfd8ee_100%)]">
            {/* Logo */}
            <div className="relative z-10 flex items-center gap-3">
                <LogoMark />
                <span className="font-sora font-bold text-lg text-[#0B1220]">StartupSwarm</span>
            </div>

            {/* Three.js scene fills middle */}
            <div className="absolute inset-0">
                <ParticleScene />
            </div>

            {/* Bottom copy */}
            <div className="relative z-10">
                <h2 className="font-sora font-bold text-3xl text-[#0B1220] leading-tight mb-4">
                    Your launchpad<br />for what&apos;s next.
                </h2>
                {/* Social proof badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm">
                    <UsersIcon />
                    <span className="text-sm font-medium text-slate-600">Trusted by 12,000+ founders worldwide</span>
                </div>
            </div>
        </div>
    );
}
