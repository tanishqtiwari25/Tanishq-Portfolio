import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

export default function Experience() {
  const milestones = [
    {
      title: "Full Stack Web Development Bootcamp",
      organization: "Coding Ninjas / Intensive Training",
      period: "Bootcamp Graduate",
      description: "Completed rigorous practical curriculum focusing on modern web development architectures, algorithms, and full-stack integration.",
      bullets: [
        "Mastered core HTML5, CSS3, JavaScript (ES6+), and asynchronous programming.",
        "Engineered single-page applications using React.js and component lifecycle paradigms.",
        "Built REST APIs using Express/Node.js and managed database collections with MongoDB.",
        "Practiced version control workflows utilizing Git and GitHub pull requests."
      ]
    },
    {
      title: "Hands-on Project Development & Freelance Work",
      organization: "Independent Development",
      period: "Ongoing",
      description: "Building production-ready software solutions for business websites, scrapers, and frontend applications.",
      bullets: [
        "Architected E-Commerce UIs, CRM dashboards, and client web portals.",
        "Integrated third-party APIs and parsed real-time automated data pipelines.",
        "Applied Prompt Engineering techniques to streamline component creation and code quality."
      ]
    }
  ];

  return (
    <section id="journey" className="py-20 border-t border-surfaceBorder/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accentPrimary">
            // Professional Growth
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textMain tracking-tight">
            Learning Journey &amp; Practical Experience
          </h2>
          <div className="w-12 h-1 bg-accentPrimary mx-auto rounded-full" />
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto space-y-8 relative before:absolute before:inset-0 before:left-3 sm:before:left-1/2 before:-translate-x-px before:w-0.5 before:bg-surfaceBorder">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative flex items-start group">
              
              {/* Timeline Center Dot */}
              <div className="absolute left-3 sm:left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-surface border-2 border-accentPrimary flex items-center justify-center text-accentPrimary shadow-md z-10">
                <Briefcase className="w-3.5 h-3.5" />
              </div>

              {/* Content Box */}
              <div className={`ml-12 sm:ml-0 w-full sm:w-[calc(50%-2rem)] ${idx % 2 === 0 ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
                <div className="p-6 rounded-2xl bg-surface border border-surfaceBorder space-y-3 hover:border-accentPrimary/40 transition-colors shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surfaceBorder/60 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-textMain">{m.title}</h3>
                      <span className="text-xs text-accentPrimary font-medium">{m.organization}</span>
                    </div>
                    <span className="text-[11px] font-mono text-textMuted flex items-center gap-1 bg-background px-2.5 py-1 rounded-md border border-surfaceBorder">
                      <Calendar className="w-3 h-3 text-accentPrimary" /> {m.period}
                    </span>
                  </div>

                  <p className="text-xs text-textMuted">{m.description}</p>

                  <ul className="space-y-1.5 pt-1">
                    {m.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accentPrimary shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}