import { ArrowUpRight, ArrowDown, Github, Linkedin } from "lucide-react";
export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="hero-topline">
          <span className="eyebrow">
            <span className="status-dot" /> AVAILABLE FOR OPPORTUNITIES
          </span>
          <span className="hero-edition">INDEPENDENT DEVELOPER / INDIA</span>
        </div>
        <div className="hero-copy">
          <p className="hero-intro hero-enter" style={{ "--delay": "100ms" }}>
            Tanishq Tiwari <span>— Frontend Developer</span>
          </p>
          <h1>
            <span className="headline-mask">
              <span style={{ "--delay": "180ms" }}>Thoughtful code.</span>
            </span>
            <span className="headline-mask">
              <span className="headline-outline" style={{ "--delay": "290ms" }}>
                Meaningful
              </span>
            </span>
            <span className="headline-mask">
              <span
                className="headline-gradient"
                style={{ "--delay": "400ms" }}
              >
                experiences.
              </span>
            </span>
          </h1>
          <p
            className="hero-description hero-enter"
            style={{ "--delay": "520ms" }}
          >
            I build intuitive digital products with React, Next.js and
            JavaScript. Bringing business thinking and a careful eye for detail
            to every interface.
          </p>
          <div
            className="hero-actions hero-enter"
            style={{ "--delay": "640ms" }}
          >
            <a href="#projects" className="primary-button" data-magnetic>
              Explore selected work <ArrowUpRight size={18} />
            </a>
            <a href="#contact" className="secondary-button" data-magnetic>
              Let’s talk <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <div className="hero-art-label" aria-hidden="true">
          <span className="art-line" />
          <span>IDEAS TAKE SHAPE.</span>
          <small>EXPLORATION IN FORM & FUNCTION</small>
        </div>
        <div className="hero-bottom">
          <a href="#about" className="scroll-cue">
            <span>
              <ArrowDown size={15} />
            </span>{" "}
            SCROLL TO EXPLORE
          </a>
          <div className="hero-social">
            <a
              href="https://github.com/tanishqtiwari25"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={15} /> GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/tanishq-tiwari-31138b252"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={15} /> LinkedIn ↗
            </a>
          </div>
          <span>BASED IN KANPUR, INDIA</span>
        </div>
      </div>
    </section>
  );
}
