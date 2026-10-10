/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surfaceBorder: "rgb(var(--color-border) / <alpha-value>)",
        accentPrimary: "rgb(var(--color-primary) / <alpha-value>)",
        accentSecondary: "rgb(var(--color-secondary) / <alpha-value>)",
        textMain: "rgb(var(--color-text) / <alpha-value>)",
        textMuted: "rgb(var(--color-text-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "hero-gradient": "var(--gradient-hero)",
        "card-glow": "var(--gradient-card)",
      },
    },
  },
  plugins: [],
};
