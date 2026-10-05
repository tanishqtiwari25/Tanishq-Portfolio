import { ArrowUpRight, Github, Linkedin, MapPin } from 'lucide-react';
export default function Hero() {
return <section id="home" className="hero relative bg-hero-gradient"><div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
<div className="hero-copy"><p className="eyebrow hero-enter" style={{'--delay':'80ms'}}><span className="status-dot"/> Available for frontend opportunities</p>
<p className="hero-intro hero-enter" style={{'--delay':'170ms'}}>Hello, I’m Tanishq Tiwari.</p>
<h1 className="hero-enter" style={{'--delay':'260ms'}}>Frontend<br/><span>Developer.</span></h1>
<p className="hero-description hero-enter" style={{'--delay':'370ms'}}>I turn ideas into thoughtful web experiences.<br/>Building with JavaScript, React and Next.js — with a focus on clean interfaces and real-world functionality.</p>
<div className="flex flex-wrap gap-4 hero-enter mt-8" style={{'--delay':'480ms'}}><a href="#projects" className="primary-button">Explore my work <ArrowUpRight size={18}/></a><a href="#contact" className="secondary-button">Let’s talk <ArrowUpRight size={18}/></a></div>
<div className="hero-enter hero-meta" style={{'--delay':'570ms'}}><span className="flex items-center gap-2"><MapPin size={14}/> Kanpur, India</span><a href="https://github.com/tanishqtiwari25" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"><Github size={18}/></a><a href="https://www.linkedin.com/in/tanishq-tiwari-31138b252" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile"><Linkedin size={18}/></a></div></div>
<div className="hero-art-label" aria-hidden="true"><span>FORM / FUNCTION</span><span>JavaScript · React · Next.js</span></div>
<div className="hero-bottom"><span>FRONTEND ENGINEERING · BUSINESS THINKING</span><a href="#about">Scroll to discover ↓</a></div></div></section>;
}
