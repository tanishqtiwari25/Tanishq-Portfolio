'use client';

import { useEffect } from 'react';
import { X, Github, ExternalLink, CheckCircle2, AlertCircle, Lightbulb, Code2, UserCheck } from 'lucide-react';

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-surface border border-surfaceBorder shadow-2xl overflow-y-auto text-textMain flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-surface/90 backdrop-blur-md border-b border-surfaceBorder flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-accentPrimary uppercase tracking-wider">
              Project Case Study
            </span>
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-textMain">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-background border border-surfaceBorder text-textMuted hover:text-textMain focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-8 text-sm leading-relaxed text-textMuted">
          
          {/* Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-semibold text-textMain uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-accentPrimary" />
              Project Overview
            </h3>
            <p>{project.shortDescription}</p>
          </div>

          {/* Tech Stack Used */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-semibold text-textMain uppercase tracking-wider">
              Technologies Utilized
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-3 py-1 rounded-md bg-background border border-surfaceBorder text-accentPrimary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Problem & Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-background/50 border border-surfaceBorder space-y-2">
              <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase">
                <AlertCircle className="w-4 h-4" /> Problem Statement
              </h4>
              <p className="text-xs text-textMuted">{project.problem}</p>
            </div>

            <div className="p-4 rounded-xl bg-background/50 border border-surfaceBorder space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase">
                <Lightbulb className="w-4 h-4" /> Architectural Solution
              </h4>
              <p className="text-xs text-textMuted">{project.solution}</p>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-textMain uppercase tracking-wider">
              Key Features &amp; Implementations
            </h3>
            <ul className="space-y-2">
              {project.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-textMuted">
                  <CheckCircle2 className="w-4 h-4 text-accentPrimary shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Role & Engineering Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surfaceBorder">
            <div>
              <h4 className="text-xs font-semibold text-textMain mb-1 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-accentPrimary" /> My Contributions
              </h4>
              <p className="text-xs text-textMuted">{project.myRole}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-textMain mb-1">Key Learnings</h4>
              <p className="text-xs text-textMuted">{project.whatILearned}</p>
            </div>
          </div>

        </div>

        {/* Modal Footer Links */}
        <div className="px-6 py-4 bg-background/80 border-t border-surfaceBorder flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-surface border border-surfaceBorder text-textMain text-xs font-medium hover:border-accentPrimary flex items-center gap-1.5"
              >
                <Github className="w-4 h-4" /> View Repository
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-accentPrimary text-background text-xs font-semibold hover:bg-sky-400 flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Live Demo
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-xs text-textMuted hover:text-textMain"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}