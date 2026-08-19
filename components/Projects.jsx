'use client';

import { useState } from 'react';
import { projectsData } from '@/data/projectsData';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section id="projects" className="py-20 bg-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accentPrimary">
            // Featured Work
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textMain tracking-tight">
            Production-Grade &amp; Practical Projects
          </h2>
          <p className="text-textMuted text-sm sm:text-base">
            Detailed breakdown of real applications built with React, Node.js, and modern CSS frameworks. Click any card for the engineering case study.
          </p>
          <div className="w-12 h-1 bg-accentPrimary mx-auto rounded-full" />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenModal={(p) => setSelectedProject(p)}
            />
          ))}
        </div>

        {/* Case Study Modal rendering */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}

      </div>
    </section>
  );
}