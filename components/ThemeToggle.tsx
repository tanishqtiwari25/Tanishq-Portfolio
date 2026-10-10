"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    setLight(document.documentElement.dataset.theme === "light");
  }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    try {
      localStorage.setItem("portfolio-theme", next ? "light" : "dark");
    } catch {}
  }
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
    >
      {light ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
