import { Code2, ArrowUp } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-surfaceBorder bg-background text-xs text-textMuted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-surface border border-surfaceBorder flex items-center justify-center text-accentPrimary">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-textMain">Tanishq Tiwari</span>
            <span className="text-surfaceBorder">|</span>
            <span>Frontend Developer</span>
          </div>

          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Tanishq Tiwari. Designed with Next.js &amp; Tailwind CSS.
          </p>

          <a
            href="#"
            className="p-2.5 rounded-lg bg-surface border border-surfaceBorder hover:border-accentPrimary hover:text-accentPrimary transition-colors flex items-center gap-1.5"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </a>

        </div>
      </div>
    </footer>
  );
}