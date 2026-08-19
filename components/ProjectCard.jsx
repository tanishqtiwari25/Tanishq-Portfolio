'use client';

import { ExternalLink, Github, ArrowRight, Layers } from 'lucide-react';

export default function ProjectCard({ project, onOpenModal }) {
  return (
    <div className="group rounded-2xl bg-surface border border-surfaceBorder hover:border-accentPrimary/50 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:-translate-y-1">
      
      {/* Project Header Banner / Preview Placeholder */}
      <div className="relative h-48 w-full bg-gradient-to-br from-slate-900 via-surface to-slate-900 border-b border-surfaceBorder flex items-center justify-center p-6 overflow-hidden">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative text-center space-y-2 z-10">
          <div className="w-12 h-12 mx-auto rounded-xl bg-background/80 border border-surfaceBorder flex items-center justify-center text-accentPrimary shadow-md group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <span className="inline-block text-[11px] font-mono font-medium text-accentPrimary uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accentPrimary/10 border border-accentPrimary/20">
            {project.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-textMain group-hover:text-accentPrimary transition-colors">
            {project.title}
          </h3>

          <p className="text-xs text-textMuted leading-relaxed line-clamp-3">
            {project.shortDescription}
          </p>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-1 rounded-md bg-background border border-surfaceBorder/80 text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-4 border-t border-surfaceBorder/60 flex items-center justify-between">
          <button
            suppressHydrationWarning
            onClick={() => onOpenModal(project)}
            className="text-xs font-semibold text-accentPrimary hover:underline flex items-center gap-1"
          >
            Case Study <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background border border-surfaceBorder text-textMuted hover:text-textMain hover:border-accentPrimary/40 transition-colors"
                aria-label="View Code on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background border border-surfaceBorder text-textMuted hover:text-textMain hover:border-accentPrimary/40 transition-colors"
                aria-label="View Live Demo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}