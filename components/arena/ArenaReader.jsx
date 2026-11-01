"use client";
import { useEffect, useRef } from "react";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import EducationCertifications from "@/components/EducationCertifications";
import Contact from "@/components/Contact";
import ProjectModal from "@/components/ProjectModal";
export default function ArenaReader({ section, onClose, project }) {
  const root = useRef(null);
  useEffect(() => {
    if (project) return;
    const previous = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.current?.querySelector("button")?.focus();
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = [
          ...root.current.querySelectorAll(
            "a[href],button,input,textarea,select",
          ),
        ].filter((el) => el.getClientRects().length && !el.disabled);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, [onClose, project]);
  if (project) return <ProjectModal project={project} onClose={onClose} />;
  return (
    <div className="arena-reader-backdrop">
      <div
        ref={root}
        className="arena-reader"
        role="dialog"
        aria-modal="true"
        aria-labelledby="arena-reader-title"
      >
        <div className="arena-reader-top">
          <h2 id="arena-reader-title">
            {section === "contact"
              ? "The contact desk"
              : section === "skills"
                ? "Technical profile"
                : section === "education" ? "Education & certifications" : section === "experience" ? "Development experience" : "Behind the work"}
          </h2>
          <button onClick={onClose} aria-label="Close portfolio reader">
            Close ×
          </button>
        </div>
        <div className="arena-reader-body">
          {section === "contact" ? (
            <Contact />
          ) : section === "skills" ? (
            <Skills />
          ) : section === "education" ? (<EducationCertifications />) : section === "experience" ? (<Experience />) : (
            <>
              <About />
              <Experience />
              <EducationCertifications />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
