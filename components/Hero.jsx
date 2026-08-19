'use client';

import { ArrowRight, Download, Github, Linkedin, Mail, Terminal, MapPin } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-hero-gradient">
      {/* Background Subtle Grid Element */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38BDF8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Info (Col 7) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-surfaceBorder text-xs text-textMuted">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Available for Frontend / React Opportunities</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-textMain leading-[1.15]">
              Building Modern, Scalable &{' '}
              <span className="bg-gradient-to-r from-accentPrimary via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                User-Focused
              </span>{' '}
              Web Experiences.
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-textMuted max-w-2xl font-normal leading-relaxed">
              Frontend Developer specializing in <strong className="text-textMain font-semibold">JavaScript (ES6+)</strong>, <strong className="text-textMain font-semibold">React.js</strong>, and modern CSS architecture. Focused on crafting fast, intuitive, and conversion-ready interfaces.
            </p>

            {/* Secondary Badge / Location */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-textMuted pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accentPrimary" /> Kanpur, Uttar Pradesh, India
              </span>
              <span className="text-surfaceBorder">•</span>
              <span>Generative AI Enthusiast</span>
              <span className="text-surfaceBorder">•</span>
              <span>MBA (Information Technology)</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="px-6 py-3.5 rounded-xl bg-accentPrimary text-background font-semibold text-sm hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/10 flex items-center gap-2 group"
              >
                View Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="https://realtanishqtiwari.in/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-surface border border-surfaceBorder text-textMain font-medium text-sm hover:border-accentPrimary hover:text-accentPrimary transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </a>

              <a
                href="#contact"
                className="px-6 py-3.5 rounded-xl border border-transparent text-textMuted hover:text-textMain font-medium text-sm transition-colors"
              >
                Contact Me
              </a>
            </div>

            {/* Social Links Bar */}
            <div className="pt-6 flex items-center gap-5 border-t border-surfaceBorder/60">
              <span className="text-xs uppercase tracking-wider text-textMuted font-mono">Connect:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/tanishqtiwati25" // Replace with real profile link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-accentPrimary hover:border-accentPrimary/40 transition-all"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/tanishq-tiwari-31138b252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-accentPrimary hover:border-accentPrimary/40 transition-all"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="mailto:tanishqtiwari265@gmail.com"
                  className="p-2 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-accentPrimary hover:border-accentPrimary/40 transition-all"
                  aria-label="Email Me"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Developer Visual Element (Col 5) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Subtle Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accentPrimary/20 to-accentSecondary/20 blur-xl opacity-50" />

              {/* Developer Terminal Card */}
              <div className="relative rounded-2xl bg-surface border border-surfaceBorder shadow-2xl overflow-hidden font-mono text-xs">
                
                {/* Window Header */}
                <div className="bg-[#0D131F] px-4 py-3 border-b border-surfaceBorder flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-1 text-textMuted text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-accentPrimary" />
                    <span>tanishq-tiwari.js</span>
                  </div>
                  <div className="w-12" /> {/* Spacer */}
                </div>

                {/* Window Code Content */}
                <div className="p-5 space-y-3 leading-relaxed text-slate-300">
                  <div>
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-accentPrimary">developer</span> = &#123;
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-400">name:</span>{' '}
                    <span className="text-emerald-300">&apos;Tanishq Tiwari&apos;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-400">role:</span>{' '}
                    <span className="text-emerald-300">&apos;Frontend Developer&apos;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-400">coreStack:</span> [
                    <span className="text-amber-300">&apos;React.js&apos;</span>,{' '}
                    <span className="text-amber-300">&apos;JavaScript ES6+&apos;</span>,{' '}
                    <span className="text-amber-300">&apos;Next.js&apos;</span>,{' '}
                    <span className="text-amber-300">&apos;Tailwind&apos;</span>],
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-400">location:</span>{' '}
                    <span className="text-emerald-300">&apos;Kanpur, UP, India&apos;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-400">education:</span>{' '}
                    <span className="text-emerald-300">&apos;MBA (IT) &amp; BBA&apos;</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-400">focus:</span>{' '}
                    <span className="text-emerald-300">&apos;Clean Code, Performant UI &amp; Dynamic APIs&apos;</span>
                  </div>
                  <div>&#125;;</div>
                  <div className="pt-2 text-textMuted flex items-center gap-2">
                    <span className="text-accentPrimary">&gt;</span> developer.buildNextProject()
                    <span className="inline-block w-2 h-4 bg-accentPrimary animate-pulse" />
                  </div>
                </div>

                {/* Footer Status inside card */}
                <div className="bg-[#0D131F] px-4 py-2 border-t border-surfaceBorder/60 flex justify-between items-center text-[10px] text-textMuted">
                  <span>Git Branch: main</span>
                  <span className="text-emerald-400">Status: Ready to Deploy</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}