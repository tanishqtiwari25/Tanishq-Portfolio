"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
export default function ScrollExperience() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({
        duration: 0.85,
        smoothWheel: true,
        anchors: { offset: -90 },
        allowNestedScroll: true,
      });
      const tick = (time) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.utils
        .toArray("section:not(#home) h2, section:not(#home) .rounded-2xl")
        .forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 24,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          });
        });
      gsap.fromTo(
        ".timeline-track",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "#journey",
            start: "top 70%",
            end: "bottom 70%",
            scrub: 0.5,
          },
        },
      );
      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.15 },
      });
      document.querySelectorAll("[data-counter]").forEach((el) => {
        const end = Number(el.dataset.counter);
        const state = { value: 0 };
        gsap.to(state, {
          value: end,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(state.value) + el.dataset.suffix;
          },
        });
      });
      const buttons = [...document.querySelectorAll("[data-magnetic]")];
      const listeners = buttons.map((button) => {
        const move = (e) => {
          if (!matchMedia("(pointer:fine)").matches) return;
          const r = button.getBoundingClientRect();
          gsap.to(button, {
            x: (e.clientX - r.left - r.width / 2) * 0.12,
            y: (e.clientY - r.top - r.height / 2) * 0.15,
            duration: 0.3,
          });
        };
        const leave = () =>
          gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(1,.5)",
          });
        button.addEventListener("pointermove", move);
        button.addEventListener("pointerleave", leave);
        return () => {
          button.removeEventListener("pointermove", move);
          button.removeEventListener("pointerleave", leave);
        };
      });
      const pause = (e) => {
        e.detail ? lenis.stop() : lenis.start();
      };
      window.addEventListener("portfolio-modal", pause);
      ScrollTrigger.refresh();
      return () => {
        listeners.forEach((fn) => fn());
        window.removeEventListener("portfolio-modal", pause);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });
    return () => media.revert();
  }, []);
  return <div className="scroll-progress" aria-hidden="true" />;
}
