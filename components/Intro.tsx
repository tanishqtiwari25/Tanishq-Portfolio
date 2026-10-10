"use client";
import { useEffect, useRef } from "react";
export default function Intro() {
  const root = useRef<HTMLDivElement>(null),
    count = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("portfolio-intro") === "seen";
    } catch {}
    if (
      seen ||
      innerWidth < 768 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      node.style.display = "none";
      return;
    }
    node.classList.add("intro-active");
    let frame = 0;
    const start = performance.now();
    const tick = (time: number) => {
      const p = Math.min((time - start) / 1800, 1);
      if (count.current)
        count.current.textContent = String(Math.round(p * 100)).padStart(
          3,
          "0",
        );
      if (p < 1) frame = requestAnimationFrame(tick);
      else {
        node.classList.add("intro-done");
        try {
          sessionStorage.setItem("portfolio-intro", "seen");
        } catch {}
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-mark">
        T<span>.</span>
      </div>
      <div className="intro-bottom">
        <span>A LITTLE THOUGHT. EVERY DETAIL.</span>
        <span ref={count}>000</span>
      </div>
    </div>
  );
}
