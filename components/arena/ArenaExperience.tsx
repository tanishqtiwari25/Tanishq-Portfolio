"use client";
import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Menu,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { CHAPTERS, sampleJourney } from "@/lib/arena/journey.mjs";
import type { JourneyState } from "./ArenaWorld";
import { useArenaAudio } from "./useArenaAudio";
const Scene = dynamic(() => import("./ArenaScene"), { ssr: false });
const Reader = dynamic(() => import("./ArenaReader"), { ssr: false });
class SceneBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function ArenaExperience() {
  const journey = useRef<JourneyState>({
    target: 0,
    current: 0,
    intro: 0,
    paused: false,
    reduced: false,
    mobile: false,
  });
  const [mounted, setMounted] = useState(false),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [chapter, setChapter] = useState(0),
    [selected, setSelected] = useState(1),
    [deskSection, setDeskSection] = useState("skills"),
    [paused, setPaused] = useState(false),
    [menu, setMenu] = useState(false),
    [visible, setVisible] = useState(true),
    [reader, setReader] = useState<{ section: string; project?: any } | null>(
      null,
    );
  const progress = useRef<HTMLDivElement>(null),
    menuRef = useRef<HTMLDivElement>(null),
    menuTrigger = useRef<HTMLButtonElement>(null);
  const audio = useArenaAudio();
  const audioMix = audio.mix;
  useEffect(() => {
    document.documentElement.classList.add("arena-active");
    const motion = matchMedia("(prefers-reduced-motion:reduce)");
    const params = new URLSearchParams(location.search);
    journey.current.metrics=params.get('metrics')==='1';
    const forceReduced = params.get("motion") === "reduce";
    if (params.get("view") === "readable") setFailed(true);
    const resize = () => {
      journey.current.mobile = innerWidth < 768;
    };
    const reduce = () => {
      journey.current.reduced = motion.matches || forceReduced;
      document.documentElement.classList.toggle(
        "arena-reduced",
        journey.current.reduced,
      );
      if (journey.current.reduced) journey.current.intro = 1;
    };
    const scroll = () => {
      const p = Math.min(
        1,
        Math.max(
          0,
          scrollY /
            Math.max(1, document.documentElement.scrollHeight - innerHeight),
        ),
      );
      if (!journey.current.paused)
        journey.current.target = journey.current.reduced
          ? CHAPTERS[sampleJourney(p).chapter].at
          : p;
    };
    const visibility = () => setVisible(!document.hidden);
    resize();
    reduce();
    scroll();
    setMounted(true);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", reduce);
    return () => {
      document.documentElement.classList.remove(
        "arena-active",
        "arena-reduced",
      );
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", reduce);
    };
  }, []);
  useEffect(() => {
    journey.current.paused = paused || !!reader || menu;
  }, [paused, reader, menu]);
  useEffect(() => {
    if (!ready || !visible) return;
    let frame = 0,
      last = performance.now();
    const loop = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      const j = journey.current;
      if (!j.paused) j.intro = Math.min(1, j.intro + delta / 2.8);
      const c = sampleJourney(j.current).chapter;
      setChapter((old) => (old === c ? old : c));
      if (progress.current)
        progress.current.style.transform = `scaleX(${j.current})`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [ready, visible]);
  useEffect(() => {
    audioMix(CHAPTERS[chapter].at);
  }, [chapter, audioMix]);
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuTrigger.current?.focus();
      }
      if (e.key === "Tab") {
        const controls =
          menuRef.current?.querySelectorAll<HTMLElement>("button,a[href]");
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [menu]);
  const jump = useCallback((p: number) => {
    setMenu(false);
    setPaused(false);
    journey.current.paused = false;
    journey.current.intro = 1;
    journey.current.target = p;
    window.scrollTo({
      top: p * (document.documentElement.scrollHeight - innerHeight),
      behavior: "instant",
    });
  }, []);
  const read = useCallback((section: string, project?: any) => {
    journey.current.paused = true;
    setReader({ section, project });
    setMenu(false);
  }, []);
  const closeReader = useCallback(() => setReader(null), []);
  const onReady = useCallback(() => setReady(true), []),
    onFailure = useCallback(() => setFailed(true), []);
  return (
    <main className="tt-arena" data-chapter={chapter}>
      <h1 className="sr-only">Tanishq Tiwari — developer portfolio</h1>
      <a
        className="arena-skip"
        href="#arena-content"
        onClick={(e) => {
          e.preventDefault();
          read("about");
        }}
      >
        Skip to readable portfolio
      </a>
      <div
        className="arena-viewport"
        aria-label="Interactive TT Arena portfolio"
      >
        {mounted && !failed && (
          <SceneBoundary onFail={onFailure}>
            <Scene
              journey={journey}
              chapter={chapter}
              selected={selected}
              deskSection={deskSection}
              onDeskSection={setDeskSection}
              onSelect={setSelected}
              onRead={read}
              onReady={onReady}
              onFailure={onFailure}
              running={visible}
            />
          </SceneBoundary>
        )}
      </div>
      <header className="arena-header">
        <a
          href="#entrance"
          className="arena-brand"
          onClick={(e) => {
            e.preventDefault();
            jump(0);
          }}
          aria-label="TT Arena — return to entrance"
        >
          <span className="tt-monogram">
            TT<span> /</span>
          </span>
          <span className="arena-brand-caption">
            TANISHQ TIWARI
            <br />
            <small>THE PORTFOLIO EXPERIENCE</small>
          </span>
        </a>
        <div className="arena-header-actions">
          <button
            className="arena-text-control"
            onClick={() => {
              if (chapter === 3) {
                void import("@/data/projectsData").then((m) =>
                  read("project", m.projectsData[selected]),
                );
              } else read(chapter === 5 ? "contact" : chapter === 4 ? deskSection : "about");
            }}
          >
            {chapter >= 3 ? "Read this display" : "View portfolio"}{" "}
            <ArrowUpRight size={14} />
          </button>
          <button
            className="arena-icon-control"
            onClick={audio.toggle}
            aria-label={
              audio.enabled ? "Mute arena sound" : "Enable arena sound"
            }
            aria-pressed={audio.enabled}
          >
            {audio.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            ref={menuTrigger}
            className="arena-icon-control"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close arena menu" : "Open arena menu"}
            aria-expanded={menu}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
      {!ready && !failed && (
        <div className="arena-loading" role="status">
          <div className="tt-loading-mark">
            TT<span> /</span>
          </div>
          <span>LIGHTING THE ARENA</span>
          <p>Setting the stage for Tanishq Tiwari.</p>
          <div className="arena-load-line" />
          <button onClick={() => read("about")}>
            Open readable portfolio ↗
          </button>
        </div>
      )}
      {failed && (
        <div className="arena-fallback">
          <span className="arena-eyebrow">TT ARENA / TANISHQ TIWARI</span>
          <h1>
            The work.
            <br />
            Without the wait.
          </h1>
          <p>
            The 3D arena is unavailable on this device. All portfolio details
            and the contact form are available below.
          </p>
          <button onClick={() => read("about")}>About & experience ↗</button>
          <button onClick={() => read("skills")}>Skills ↗</button>
          <button onClick={() => read("contact")}>Contact ↗</button>
          <div className="fallback-projects">
            {[
              "Data Scraper",
              "Wealth Pilot",
              "Truly Grow",
              "E-Commerce Website",
              "Game",
            ].map((name, i) => (
              <button
                key={name}
                onClick={() => {
                  setSelected(i);
                  void import("@/data/projectsData").then((m) =>
                    read("project", m.projectsData[i]),
                  );
                }}
              >
                {name} ↗
              </button>
            ))}
          </div>
        </div>
      )}
      {ready && !failed && (
        <>
          <aside className="arena-side-caption" aria-hidden="true">
            INDEPENDENT DEVELOPER <span>●</span> KANPUR, INDIA
          </aside>
          <div className="arena-chapter-copy" aria-live="polite">
            <span className="arena-eyebrow">
              CHAPTER {String(chapter + 1).padStart(2, "0")} / 06
            </span>
            <p>
              {
                [
                  "Every story has an entrance.",
                  "CODE. BUILD. CREATE.",
                  "The work is worth the walk.",
                  "Step into the work.",
                  "The person behind the build.",
                  "Your next move starts here.",
                ][chapter]
              }
            </p>
          </div>
          {chapter === 0 && (
            <div className="arena-entry-actions">
              <button onClick={()=>audio.mutedPreference ? jump(.13) : void audio.enable()}>
                {audio.enabled ? "Sound enabled" : audio.mutedPreference ? "Enter arena (muted)" : "Enter with sound"}{" "}
                <Volume2 size={14} />
              </button>
              <button onClick={() => jump(0.64)}>
                Skip entrance <ArrowUpRight size={14} />
              </button>
            </div>
          )}
          <div className="arena-bottom">
            <div className="arena-scroll-cue">
              <ArrowDown size={16} />
              <span>
                SCROLL TO {chapter === 5 ? "RETRACE" : "EXPLORE"}
                <small>ONE ARENA. YOUR PACE.</small>
              </span>
            </div>
            <nav className="arena-chapter-nav" aria-label="Arena chapters">
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => jump(c.at)}
                  aria-label={`${String(i + 1).padStart(2, "0")} ${c.label}`}
                  aria-current={i === chapter ? "step" : undefined}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{c.label}</b>
                </button>
              ))}
            </nav>
            <button
              className="arena-pause"
              aria-label={paused ? "Resume journey" : "Pause journey"}
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
              <span>{paused ? "Resume" : "Pause"} journey</span>
            </button>
          </div>
          <div className="arena-asset-note">
            DEVELOPMENT AVATAR · LIKENESS PENDING{" "}
            <a href="/avatar-review">Review model ↗</a>
          </div>
        </>
      )}
      {audio.error && (
        <p className="arena-audio-error" role="status">
          {audio.error}
        </p>
      )}
      <div className="arena-progress" aria-hidden="true">
        <div ref={progress} />
      </div>
      <div className="arena-scrollspace" aria-hidden="true" />
      {mounted && journey.current.metrics && <output id="arena-render-metrics" style={{position:'fixed',top:0,left:0,zIndex:100,padding:'8px',background:'#080b11',color:'white',font:'12px monospace',pointerEvents:'none'}}>Collecting rendered frames…</output>}
      {menu && (
        <div className="arena-menu-backdrop">
          <div
            className="arena-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Arena navigation"
          >
            <div className="menu-heading">
              YOUR CORNER.
              <button
                onClick={() => {
                  setMenu(false);
                  menuTrigger.current?.focus();
                }}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            {CHAPTERS.map((c, i) => (
              <button key={c.id} onClick={() => jump(c.at)}>
                <span>0{i + 1}</span>
                {c.label}
                <ArrowUpRight size={24} />
              </button>
            ))}
            <div className="menu-detail-actions">
              <button onClick={() => read("about")}>
                Biography & experience
              </button>
              <button onClick={() => read("skills")}>All skills</button><button onClick={() => read("education")}>Education & certifications</button><button onClick={() => read("experience")}>Experience</button>
              <button onClick={() => read("contact")}>Contact form</button>
              <a href="/avatar-review">Avatar & reference review ↗</a>
            </div>
          </div>
        </div>
      )}
      {reader && (
        <Reader
          section={reader.section}
          project={reader.project}
          onClose={closeReader}
        />
      )}
      <noscript>
        <div className="arena-noscript">
          <h1>Tanishq Tiwari — Frontend Developer</h1>
          <p>
            React, Next.js and JavaScript developer in Kanpur, India. MBA in IT,
            BBA, Full Stack Web Development Bootcamp.
          </p>
          <p>JavaScript is required for the arena and contact form.</p>
          <a href="mailto:tanishqtiwari265@gmail.com">Email Tanishq</a>
          <a href="https://github.com/tanishqtiwari25">GitHub</a>
          <a href="https://montra.realtanishqtiwari.in">Wealth Pilot</a>
          <a href="https://trulygrow.realtanishqtiwari.in">Truly Grow</a>
        </div>
      </noscript>
    </main>
  );
}
