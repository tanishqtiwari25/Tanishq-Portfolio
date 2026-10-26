"use client";

import { skillsData } from "@/data/skillsData";
import {
  Code2,
  Palette,
  FileCode,
  Atom,
  Layers,
  Wind,
  Layout,
  Smartphone,
  ArrowLeftRight,
  Server,
  Cpu,
  Database,
  Binary,
  GitBranch,
  Github,
  Terminal,
  Wrench,
  LayoutGrid,
  Bot,
  MessageSquareCode,
  TrendingUp,
} from "lucide-react";

const iconMap = {
  Code2,
  Palette,
  FileCode,
  Atom,
  Layers,
  Wind,
  Layout,
  Smartphone,
  ArrowLeftRight,
  Server,
  Cpu,
  Database,
  Binary,
  GitBranch,
  Github,
  Terminal,
  Wrench,
  LayoutGrid,
  Bot,
  MessageSquareCode,
  TrendingUp,
};

export default function Skills() {
  return (
    <section id="skills" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accentPrimary">
            // Technical Proficiency
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textMain tracking-tight">
            The tools behind the thinking.
          </h2>
          <p className="text-textMuted text-sm sm:text-base">
            The tools I use to turn an idea into a responsive, functional web
            experience.
          </p>
          <div className="w-12 h-1 bg-accentPrimary mx-auto rounded-full" />
        </div>

        {/* Skills Grid */}
        <div className="skills-bento grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillsData.map((group, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-2xl bg-surface border border-surfaceBorder hover:border-surfaceBorder/80 transition-all shadow-lg"
            >
              <div className="mb-6 space-y-1">
                <h3 className="text-xl font-bold text-textMain">
                  {group.category}
                </h3>
                <p className="text-xs text-textMuted">{group.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.skills.map((skill, sIdx) => {
                  const IconComponent = iconMap[skill.icon] || Code2;
                  return (
                    <div
                      key={sIdx}
                      className="min-w-0 p-3 rounded-xl bg-background/60 border border-surfaceBorder/70 flex items-center gap-3 hover:border-accentPrimary/40 transition-colors group"
                    >
                      <div className="shrink-0 p-2 rounded-lg bg-surface text-accentPrimary group-hover:scale-105 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block break-words text-xs font-semibold text-textMain">
                          {skill.name}
                        </span>
                        <span className="block text-[10px] text-textMuted">
                          {skill.level}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
