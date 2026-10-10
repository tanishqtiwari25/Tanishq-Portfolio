"use client";
import { useEffect, useRef } from "react";
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null),
    ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = matchMedia(
      "(pointer:fine) and (hover:hover) and (prefers-reduced-motion:no-preference)",
    );
    let cleanup = () => {};
    const configure = () => {
      cleanup();
      if (!query.matches) return;
      let x = -100,
        y = -100,
        rx = -100,
        ry = -100,
        frame = 0,
        visible = false;
      const hide = () => {
        visible = false;
        document.documentElement.classList.remove("custom-pointer");
        dot.current?.classList.remove("cursor-visible");
        ring.current?.classList.remove("cursor-visible");
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        x = e.clientX;
        y = e.clientY;
        if (!visible) {
          rx = x;
          ry = y;
          visible = true;
          document.documentElement.classList.add("custom-pointer");
          dot.current?.classList.add("cursor-visible");
          ring.current?.classList.add("cursor-visible");
        }
        ring.current?.classList.toggle(
          "cursor-hover",
          !!(e.target as Element)?.closest("a,button,input,textarea"),
        );
      };
      const render = () => {
        rx += (x - rx) * 0.2;
        ry += (y - ry) * 0.2;
        if (dot.current)
          dot.current.style.transform =
            "translate3d(" + x + "px," + y + "px,0)";
        if (ring.current)
          ring.current.style.transform =
            "translate3d(" + rx + "px," + ry + "px,0)";
        frame = requestAnimationFrame(render);
      };
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", hide);
      window.addEventListener("blur", hide);
      window.addEventListener("keydown", hide);
      render();
      cleanup = () => {
        cancelAnimationFrame(frame);
        hide();
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerleave", hide);
        window.removeEventListener("blur", hide);
        window.removeEventListener("keydown", hide);
      };
    };
    configure();
    query.addEventListener("change", configure);
    return () => {
      cleanup();
      query.removeEventListener("change", configure);
    };
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
