import { Github, Code, GitCommit, ExternalLink } from 'lucide-react';

export default function GitHubStats() {
  return (
    <section className="py-20 border-t border-surfaceBorder/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-surface via-background to-surface border border-surfaceBorder shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-semibold text-accentPrimary uppercase tracking-wider flex items-center gap-2">
                <Github className="w-4 h-4" /> Open Source &amp; Code Quality
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-textMain">
                Continuous Learning &amp; Clean Commit History
              </h2>
              <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
                I maintain active repositories showcasing clean folder structure, semantic HTML, modular React hooks, and interview-defensible coding patterns.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4 justify-end">
              <a
                href="https://github.com/tanishqtiwari25" // Replace with real GitHub link
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-surface border border-surfaceBorder text-textMain text-xs font-bold hover:border-accentPrimary transition-all flex items-center justify-center gap-2 group"
              >
                <Github className="w-4 h-4 text-accentPrimary" />
                Explore GitHub Profile
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}