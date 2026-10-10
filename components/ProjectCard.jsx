"use client";
import ProjectArtwork from "./ProjectArtwork";
import { useRef } from "react";
import { ArrowUpRight, Github } from "lucide-react";
export default function ProjectCard({ project, index, onOpenModal }) {
  const card = useRef(null);
  const move = (e) => {
    if (
      !matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)")
        .matches
    )
      return;
    const r = card.current.getBoundingClientRect();
    card.current.style.setProperty(
      "--mx",
      ((e.clientX - r.left) / r.width) * 100 + "%",
    );
    card.current.style.setProperty(
      "--my",
      ((e.clientY - r.top) / r.height) * 100 + "%",
    );
    card.current.style.setProperty(
      "--rx",
      (0.5 - (e.clientY - r.top) / r.height) * 8 + "deg",
    );
    card.current.style.setProperty(
      "--ry",
      ((e.clientX - r.left) / r.width - 0.5) * 8 + "deg",
    );
  };
  const reset = () => {
    card.current.style.setProperty("--rx", "0deg");
    card.current.style.setProperty("--ry", "0deg");
  };
  return (
    <article
      ref={card}
      className="project-card"
      style={{ "--card-index": index }}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <ProjectArtwork project={project} />
      <div className="project-copy">
        <div className="project-meta">
          <span>{String(index + 1).padStart(2, "0")} / SELECTED WORK</span>
          <span>{project.category}</span>
        </div>
        <h3>{project.title}</h3>
        {project.subtitle && (
          <p className="project-subtitle">{project.subtitle}</p>
        )}
        <p>{project.shortDescription}</p>
        <div className="tech-tags">
          {project.technologies.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="project-actions">
          <button onClick={() => onOpenModal(project)}>
            View case study <ArrowUpRight size={17} />
          </button>
          <div className="flex gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={"View " + project.title + " source"}
              >
                <Github size={18} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live site ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
