"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useState } from "react";
const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function ThreeBackground() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    const update = () => {
      clearTimeout(timer);
      setEnabled(false);
      const constrained =
        innerWidth < 768 ||
        navigator.hardwareConcurrency <= 4 ||
        navigator.connection?.saveData;
      if (!media.matches && !constrained)
        timer = setTimeout(() => setEnabled(true), 1100);
    };
    update();
    media.addEventListener("change", update);
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", update);
    };
  }, []);
  return (
    <div className="scene-backdrop" aria-hidden="true">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="scene-fallback">
        <i />
        <i />
        <i />
      </div>
      {enabled && (
        <SceneBoundary>
          <Hero3D />
        </SceneBoundary>
      )}
    </div>
  );
}
