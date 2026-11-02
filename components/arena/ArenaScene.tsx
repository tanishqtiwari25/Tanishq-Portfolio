"use client";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import * as T from "three";
import ArenaWorld, { PhysicalScreen, type JourneyState } from "./ArenaWorld";
import { projectsData } from "@/data/projectsData";
import { skillsData } from "@/data/skillsData";
type Project = {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  visual?: string;
  problem?: string;
  myRole?: string;
};
type Props = {
  journey: MutableRefObject<JourneyState>;
  chapter: number;
  selected: number;
  onSelect: (n: number) => void;
  onRead: (section: string, project?: Project) => void;
  onReady: () => void;
  onFailure: () => void;
  running: boolean;
};
function Mount({ offset = 0 }: { offset?: number }) {
  return (
    <group>
      {[-3.6, 3.6].map((x) => (
        <group key={x} position={[offset, 0, 0]}>
          <mesh position={[x, 9.1, 0.7]}>
            <cylinderGeometry args={[0.1, 0.1, 7.2, 8]} />
            <meshStandardMaterial
              color="#5d6774"
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[x, 12.8, 0.7]}>
            <boxGeometry args={[0.5, 0.4, 0.8]} />
            <meshStandardMaterial color="#313842" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function Desk({ x }: { x: number }) {
  return (
    <group>
      {[-1,1].map(side=><group key={side}>
        <mesh position={[x+side*2.55,1.6,1.5]} rotation={[-.38,0,0]}><boxGeometry args={[.45,1.8,.55]}/><meshStandardMaterial color="#40454d" metalness={.85} roughness={.3}/></mesh>
        {Array.from({length:8},(_,i)=><mesh key={i} position={[x+side*2.55,1.1+i*.15,1.95]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.055,.055,.07,8]}/><meshStandardMaterial color={i%3 ? "#8c969f":"#ee173b"} metalness={.7} roughness={.3}/></mesh>)}
        <mesh position={[x+side*2.1,.55,2.1]}><boxGeometry args={[.2,1.1,.4]}/><meshStandardMaterial color="#9da3aa" metalness={.9} roughness={.35}/></mesh>
      </group>)}
      <mesh position={[x, 0.7, 1]}>
        <boxGeometry args={[4.7, 1.4, 1.8]} />
        <meshStandardMaterial color="#292f39" metalness={0.7} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[x + s * 2.2, 1.5, 1.1]}>
          <boxGeometry args={[0.14, 1.5, 0.4]} />
          <meshStandardMaterial color="#737d89" />
        </mesh>
      ))}
      <mesh position={[x, 1.42, 2]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[4.7, 0.18, 0.7]} />
        <meshStandardMaterial color="#535e6b" />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[x - 1.9 + i * 0.34, 1.52, 2.1]}>
          <boxGeometry args={[0.12, 0.05, 0.1]} />
          <meshStandardMaterial
            color={i % 3 ? "#1d242e" : "#c71535"}
            emissive={i % 3 ? "#000" : "#c71535"}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
      <mesh position={[x + 1.5, 1.65, 2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.035, 6, 18, Math.PI]} />
        <meshStandardMaterial color="#07090c" />
      </mesh>
      <mesh position={[x - 1.9, 0.2, 1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.035, 6, 22]} />
        <meshStandardMaterial color="#0c0f13" />
      </mesh>
    </group>
  );
}
function ProjectDisplay({
  journey,
  visible,
  selected,
  onSelect,
  onRead,
  offset = 0,
}: {
  offset?: number;
  journey: Props["journey"];
  visible: boolean;
  selected: number;
  onSelect: Props["onSelect"];
  onRead: Props["onRead"];
}) {
  const mount = useRef<T.Group>(null);
  const project = projectsData[selected] as Project;
  const captures: Record<string, string> = {
    "wealth-pilot": "wealth-pilot",
    "truly-grow": "truly-grow",
    "ecommerce-platform": "ecommerce",
    "2d-browser-game": "game",
  };
  const capture = captures[project.id];
  useFrame(() => {
    if (mount.current)
      mount.current.position.y = T.MathUtils.lerp(
        7.5,
        0,
        T.MathUtils.smoothstep(journey.current.current, 0.59, 0.64) * (1 - T.MathUtils.smoothstep(journey.current.current, 0.76, 0.81)),
      );
  });
  return (
    <group>
      <Mount offset={offset} />
      <group ref={mount}>
        <PhysicalScreen p={[offset, 5.3, 1.2]} rotation={[0, offset > 0 ? -0.12 : 0.12, 0]} size={[7.2, 4.3]} visible={visible}>
          <div className="project-screen-content">
            <div className="screen-kicker">
              <span>RINGSIDE / SELECTED WORK</span>
              <span>{String(selected + 1).padStart(2, "0")} / 05</span>
            </div>
            <div className="screen-project-layout">
              <div>
                <span className="screen-category">{project.category}</span>
                <h2>{project.title}</h2>
                <p>{project.shortDescription}</p>
                <div className="screen-tech">
                  {project.technologies.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div
                className={"screen-identity identity-" + project.visual}
                aria-hidden="true"
              >
                {capture ? (
                  <img
                    className="screen-capture"
                    src={"/images/arena/" + capture + "-capture.webp"}
                    alt={project.title + " live website preview"}
                  />
                ) : (
                  <span>
                    {project.visual === "wealth-pilot"
                      ? "wp."
                      : project.visual === "grow"
                        ? "tg."
                        : project.visual === "scraper"
                          ? "{ }"
                          : project.visual === "game"
                            ? "PLAY"
                            : "pickk."}
                  </span>
                )}
                <small>
                  {capture
                    ? "ACTUAL LIVE SITE CAPTURE"
                    : "PROJECT IDENTITY / NO SCREENSHOT SUPPLIED"}
                </small>
              </div>
            </div>
            <div className="screen-actions">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live demo ↗
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source ↗
                </a>
              )}
              <button onClick={() => onRead("project", project)}>
                Read case study ↗
              </button>
              <div className="screen-pagination">
                <button
                  onClick={() => onSelect((selected + 4) % 5)}
                  aria-label="Previous project"
                >
                  ←
                </button>
                <button
                  onClick={() => onSelect((selected + 1) % 5)}
                  aria-label="Next project"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </PhysicalScreen>
      </group>
    </group>
  );
}
export default function ArenaScene(props: Props) {
  const {
    journey,
    chapter,
    selected,
    onSelect,
    onRead,
    onReady,
    onFailure,
    running,
  } = props;
  const [deskSection, setDeskSection] = useState("skills");
  const topSkills = useMemo(() => skillsData[0].skills.map((s) => s.name), []);
  return (
    <ArenaWorld
      journey={journey}
      onReady={onReady}
      onFailure={onFailure}
      running={running}
    >
      <PhysicalScreen
        p={[0, 5.7, -40.62]}
        size={[20.4, 8.6]}
        visible={chapter <= 1}
      >
        <div className="stage-led-content">
          <div className="led-overline">
            TT ARENA <span>INDEPENDENT DEVELOPER / INDIA</span>
          </div>
          <p className="led-role">DEVELOPER PORTFOLIO</p>
          <h1>
            <span>TANISHQ</span> <em>TIWARI</em>
          </h1>
          <p className="led-description">
            CODE. BUILD. CREATE.
            <br />
            React, Next.js & JavaScript.
          </p>
          <div className="led-bottom">
            <span>KANPUR, INDIA</span>
            <span>WELCOME TO MY CORNER.</span>
          </div>
        </div>
      </PhysicalScreen>
      <ProjectDisplay
        journey={journey}
        visible={chapter === 3}
        offset={journey.current.mobile ? 0 : -4}
        selected={selected}
        onSelect={onSelect}
        onRead={onRead}
      />
      {!journey.current.mobile && <ProjectDisplay journey={journey} visible={chapter === 3} offset={4} selected={(selected + 1) % projectsData.length} onSelect={onSelect} onRead={onRead} />}
      <Desk x={8} />
      <PhysicalScreen
        p={[8, 2.65, 1.65]}
        size={[4.2, 2.6]}
        rotation={[-0.38, 0.12, 0]}
        visible={chapter === 4}
      >
        <div className="console-content">
          <div className="screen-kicker">
            <span>PRODUCTION DESK / PROFILE</span>
            <span className="on-air">● ON AIR</span>
          </div>
          <nav className="console-tabs" aria-label="Portfolio sections">{["about", "skills", "experience", "education"].map(section => <button key={section} aria-pressed={deskSection === section} onClick={() => setDeskSection(section)}>{section}</button>)}</nav>
          {deskSection === "about" ? <div className="console-columns">
            <div>
              <p className="screen-category">THE PERSON BEHIND THE WORK</p>
              <h2>
                A business mind.
                <br />A developer’s craft.
              </h2>
              <p>
                Frontend Developer in Kanpur, India. MBA in Information
                Technology, BBA and a Full Stack Web Development Bootcamp.
              </p>
              <button onClick={() => onRead("about")}>
                Biography, experience & education ↗
              </button>
            </div>
            <div>
              <h3>Frontend Core</h3>
              <ul>
                {topSkills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <button onClick={() => onRead("skills")}>
                Explore all skills ↗
              </button>
            </div>
          </div> : <div className="console-section-detail">
            <p className="screen-category">TANISHQ TIWARI / {deskSection.toUpperCase()}</p>
            <button onClick={() => onRead(deskSection)}>Read full {deskSection}</button>
            <h2>{deskSection === "skills" ? "ABOUT & SKILLS" : deskSection === "education" ? "EDUCATION" : "EXPERIENCE"}</h2>
            {deskSection === "skills" ? <div className="console-skill-grid">{skillsData.slice(0,3).map((category,index) => <div key={category.category}><h3>{["FRONTEND", "BACKEND", "TOOLS"][index]}</h3><div className="console-tech-tiles">{category.skills.slice(0,4).map((skill,i) => <div key={skill.name} className={"console-tech-tile tile-"+index+"-"+i}><b aria-hidden="true">{[["5","3","JS","⚛"],["API","JS","EX","DB"],["Git","GH","VS","DEV"]][index][i]}</b><span>{skill.name}</span></div>)}</div></div>)}</div> : deskSection === "education" ? <div className="console-credentials"><p><strong>2024–2026 / MBA</strong><br />Information Technology / Naraina College of Engineering & Technology</p><p><strong>2021–2024 / BBA</strong><br />Naraina College of Management</p><p>Full Stack Web Development / Coding Ninjas</p></div> : <div className="console-credentials"><p><strong>INDEPENDENT DEVELOPMENT</strong><br />Building web projects with React, Next.js and JavaScript.</p><p><strong>CODING NINJAS</strong><br />Full Stack Web Development Bootcamp graduate.</p></div>}
          </div>}
        </div>
      </PhysicalScreen>
      <Desk x={-8} />
      <PhysicalScreen
        p={[-8, 2.65, 1.65]}
        size={[4.2, 2.6]}
        rotation={[-0.38, 0, 0]}
        visible={chapter === 5}
      >
        <div className="console-content contact-console">
          <div className="screen-kicker">
            <span>THE FINAL STATION</span>
            <span>OPEN CHANNEL</span>
          </div>
          <h2>
            LET’S BUILD
            <br />
            <em>SOMETHING.</em>
          </h2>
          <p>Frontend roles, React projects & freelance inquiries.</p>
          <button
            className="console-contact-button"
            onClick={() => onRead("contact")}
          >
            Open contact form ↗
          </button>
          <div className="console-socials">
            <a href="mailto:tanishqtiwari265@gmail.com">Email ↗</a>
            <a
              href="https://github.com/tanishqtiwari25"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/tanishq-tiwari-31138b252"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </PhysicalScreen>
    </ArenaWorld>
  );
}
