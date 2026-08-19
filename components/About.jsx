import { CheckCircle2, Cpu, Rocket, Code2 } from 'lucide-react';

export default function About() {
  const highlights = [
    "Full Stack Web Development Bootcamp Graduate",
    "Hands-on expertise in React.js, Next.js, and ES6+ JavaScript",
    "Experience building E-Commerce, CRM, Scrapers, and AI interfaces",
    "Integrating business acumen (MBA in IT) with modern engineering principles",
    "Practical execution of REST API consumption and clean DOM workflows",
    "Active practitioner of Prompt Engineering & AI-assisted development"
  ];

  return (
    <section id="about" className="py-20 bg-surface/30 border-y border-surfaceBorder/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accentPrimary">
            // Professional Background
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textMain tracking-tight">
            Bridging Business Insight with Clean Engineering
          </h2>
          <div className="w-12 h-1 bg-accentPrimary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-5 text-textMuted text-base leading-relaxed">
            <p>
              I am a <strong className="text-textMain font-semibold">Frontend Developer</strong> based in Kanpur, India. My journey in web engineering stems from a strong foundation in modern web technologies, backed by an intensive <strong className="text-textMain">Full Stack Web Development Bootcamp</strong>.
            </p>
            <p>
              Rather than sticking strictly to theoretical concepts, I focus heavily on building real-world projects—including <strong className="text-textMain">E-Commerce web apps, business CRM interfaces, dynamic data scrapers, 2D browser games, and AI chatbot UIs</strong>. I take pride in creating modular, reusable components, organizing clean codebase structures, and ensuring optimal user experiences across all devices.
            </p>
            <p>
              Holding an <strong className="text-textMain">MBA in Information Technology</strong> alongside a BBA, I possess a unique blend of business process comprehension and technical execution. This allows me to communicate effectively with product stakeholders, understand user conversion flows, and build interfaces aligned with real business goals.
            </p>
            <p>
              I actively keep up with the modern JS ecosystem, explore <strong className="text-textMain">Generative AI workflows</strong>, and refine my engineering patterns daily.
            </p>
          </div>

          {/* Highlights Box Column */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-surfaceBorder space-y-6 shadow-xl">
              <h3 className="text-lg font-semibold text-textMain flex items-center gap-2">
                <Code2 className="w-5 h-5 text-accentPrimary" />
                Key Qualifications
              </h3>
              
              <ul className="space-y-3">
                {highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-textMuted">
                    <CheckCircle2 className="w-4 h-4 text-accentPrimary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-surfaceBorder/60 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-background/50 border border-surfaceBorder">
                  <span className="block text-xl font-bold text-textMain">6+</span>
                  <span className="text-xs text-textMuted">Practical Projects</span>
                </div>
                <div className="p-3 rounded-xl bg-background/50 border border-surfaceBorder">
                  <span className="block text-xl font-bold text-textMain">100%</span>
                  <span className="text-xs text-textMuted">Clean Code Focus</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}