"use client";
import { useRef, useState, useEffect, useCallback } from "react";
/** Original synthesized stadium bed; no copyrighted recordings and no autoplay audio. */
export function useArenaAudio() {
  const engine = useRef<{
    ctx: AudioContext;
    gain: GainNode;
    filter: BiquadFilterNode;
    source: AudioBufferSourceNode;
    osc: OscillatorNode;
  } | null>(null);
  const [enabled, setEnabled] = useState(false),
    [error, setError] = useState("");
  const enable = useCallback(async () => {
    try {
      if (!engine.current) {
        const ctx = new AudioContext();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate),
          data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          last = (last + Math.random() * 0.035 - 0.0175) * 0.97;
          data[i] = last;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 700;
        filter.Q.value = 0.5;
        const gain = ctx.createGain();
        gain.gain.value = 0.2;
        source.connect(filter).connect(gain).connect(ctx.destination);
        source.start();
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 0.18;
        const mod = ctx.createGain();
        mod.gain.value = 250;
        osc.connect(mod).connect(filter.frequency);
        osc.start();
        engine.current = { ctx, gain, filter, source, osc };
      }
      await engine.current.ctx.resume();
      setEnabled(true);
      setError("");
    } catch {
      setError("Audio unavailable in this browser.");
    }
  }, []);
  const toggle = useCallback(async () => {
    if (enabled) {
      await engine.current?.ctx.suspend();
      setEnabled(false);
    } else await enable();
  }, [enabled, enable]);
  const mix = useCallback((p: number) => {
    const e = engine.current;
    if (!e) return;
    e.gain.gain.setTargetAtTime(p < 0.2 ? 0.14 : 0.23, e.ctx.currentTime, 0.5);
  }, []);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) void engine.current?.ctx.suspend();
      else if (enabled) void engine.current?.ctx.resume();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
    };
  }, [enabled]);
  useEffect(
    () => () => {
      engine.current?.source.stop();
      engine.current?.osc.stop();
      void engine.current?.ctx.close();
    },
    [],
  );
  return { enabled, error, enable, toggle, mix };
}
