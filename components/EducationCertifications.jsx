import { GraduationCap, Award, ExternalLink } from 'lucide-react';

export default function EducationCertifications() {
  const education = [
    {
      degree: "Master of Business Administration (MBA)",
      institution: "Naraina College of Engineering and Technology",
      specialization: "Specialization: Information Technology",
      period: "2024 – 2026"
    },
    {
      degree: "Bachelor of Business Administration (BBA)",
      institution: "Naraina College of Management",
      specialization: "Business Management & Operations",
      period: "2021 – 2024"
    }
  ];

  const certifications = [
    {
      title: "Frontend Development Certificate",
      issuer: "Coding Ninjas",
      badge: "Verified"
    },
    {
      title: "Generative AI & Digital Marketing",
      issuer: "IBM",
      badge: "Verified"
    },
    {
      title: "Build with AI Workshop",
      issuer: "AI Developer Community",
      badge: "Verified"
    }
  ];

  return (
    <section id="education" className="py-20 bg-surface/30 border-t border-surfaceBorder/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Education Column */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accentPrimary">
                // Academic Foundation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-textMain flex items-center gap-2">
                <GraduationCap className="w-7 h-7 text-accentPrimary" />
                Education
              </h2>
            </div>

            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-surface border border-surfaceBorder hover:border-accentPrimary/40 transition-colors shadow-md space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-textMain">{edu.degree}</h3>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-background border border-surfaceBorder text-accentPrimary">
                      {edu.period}
                    </span>
                  </div>
                  <p className="text-xs text-textMain font-medium">{edu.institution}</p>
                  <p className="text-xs text-textMuted">{edu.specialization}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Column */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accentPrimary">
                // Credentials
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-textMain flex items-center gap-2">
                <Award className="w-7 h-7 text-accentPrimary" />
                Certifications
              </h2>
            </div>

            <div className="space-y-4">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-surface border border-surfaceBorder flex items-center justify-between hover:border-accentPrimary/40 transition-colors shadow-md"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-textMain">{cert.title}</h3>
                    <p className="text-xs text-textMuted">{cert.issuer}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {cert.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}