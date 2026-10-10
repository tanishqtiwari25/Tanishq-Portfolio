"use client";

import { useState } from "react";
import { projectsData } from "@/data/projectsData";
import ProjectCard from "./ProjectCard";
import dynamic from "next/dynamic";
const ProjectModal = dynamic(() => import("./ProjectModal"), { ssr: false });

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section id="projects" className="py-20 bg-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accentPrimary">
            03 / Selected Work
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textMain tracking-tight">
            Built with purpose.
          </h2>
          <p className="text-textMuted text-sm sm:text-base">
            From automated data collection to intuitive product interfaces.
            Explore the work, the functionality and the thinking behind it.
          </p>
          <div className="w-12 h-1 bg-accentPrimary mx-auto rounded-full" />
        </div>

        {/* Projects Grid */}
        <div className="project-list">
          {projectsData.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
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
