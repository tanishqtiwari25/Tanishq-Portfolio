"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, Code2, ArrowUpRight } from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#journey" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const escape = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-surfaceBorder py-3 shadow-lg shadow-black/20"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2 group text-xl font-bold tracking-tight text-textMain"
            aria-label="T. Tanishq® — Home"
          >
            <div className="w-9 h-9 rounded-lg bg-surface border border-surfaceBorder flex items-center justify-center text-accentPrimary group-hover:border-accentPrimary/50 transition-colors">
              <span className="brand-initial">T.</span>
            </div>
            <span>
              Tanishq<span className="text-accentPrimary">®</span>
            </span>
          </a>

          {/* Desktop Links */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-textMuted hover:text-accentPrimary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <ThemeToggle />
          {/* Mobile Menu Toggle */}
          <button
            suppressHydrationWarning
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-textMain "
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="md:hidden border-b border-surfaceBorder bg-surface/95 backdrop-blur-lg px-4 pt-4 pb-6 mt-3 space-y-3"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-textMuted hover:text-accentPrimary transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
