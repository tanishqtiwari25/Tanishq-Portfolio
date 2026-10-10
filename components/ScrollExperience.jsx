"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const DesktopMotion = dynamic(() => import("./DesktopMotion"), { ssr: false });
export default function ScrollExperience() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = matchMedia(
      "(min-width:768px) and (prefers-reduced-motion:no-preference)",
    );
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return enabled ? <DesktopMotion /> : null;
}
