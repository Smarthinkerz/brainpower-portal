import { useRef, useEffect, useState, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Link, useLocation } from "wouter";
import { motion, useInView, useSpring } from "framer-motion";
import { ArrowRight, Briefcase, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Video CDN URL
const VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/FinalBrainPowerAIPortal_72f7d853.mp4";

// Original image URLs from ai-portal source
const IMAGES = {
  heroLeft: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/robot-ai-combined_3440e05b.png",  // Combined robot+neural (CDN)
  heroRight: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/neionimage_7d1baf2f.png",  // Neural head pink/purple (CDN)
  heroOuter: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/male-robot-ai-U9KnDeqYsDhgpp9XahVBFM.webp",  // Male robot AI (CDN)
  heroBackground: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/robot-ai-combined_3440e05b.png", // Combined robot+neural (CDN)
  phoneLeft: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/worldsfirst_d1c8bd17.png",  // App screenshot - World's First DIS
  phoneRight: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/brainpower-choosescope_8bf4fd76.png",  // App screenshot - Choose Scope
  appGif: "https://i.imgur.com/pCFfCo8.gif",        // App interface GIF
  conceptSystemic: "https://i.imgur.com/5mVtSaH.png",
  conceptCognitive: "https://i.imgur.com/6MKuZfE.png",
  conceptDecision: "https://i.imgur.com/Y3N0o6Q.png",
  conceptMental: "https://i.imgur.com/1JM2cqu.png",
};

const concepts = [
  {
    title: "Systemic Thinking",
    slug: "systemic-thinking",
    description: "Understand the full system, not just isolated parts.",
    image: IMAGES.conceptSystemic,
  },
  {
    title: "Cognitive Biases",
    slug: "cognitive-biases",
    description: "Identify blind spots and improve judgment quality.",
    image: IMAGES.conceptCognitive,
  },
  {
    title: "Decision Intelligence",
    slug: "decision-intelligence",
    description: "Bring structure and clarity to high-impact decisions.",
    image: IMAGES.conceptDecision,
  },
  {
    title: "Mental Models",
    slug: "mental-models",
    description: "Frame problems more effectively and expand strategic thinking.",
    image: IMAGES.conceptMental,
  },
];

const metrics = [
  // Every figure here is traceable to the engine. Sources, in order:
  //   10,000  default iterations in simulation-engine.ts, asserted by
  //           iterations-assertion.test.ts (REQUIRED_ITERATIONS = 10000)
  //        8  the validTypes list in simulation-engine.ts — point, uniform,
  //           triangular, normal, lognormal, pert, bernoulli, categorical
  //       10  the ADVISORS array in advisory-board.router.ts, whose consensus
  //           output includes a disagreementMap field
  //     100%  seeded RNG plus deterministicResultHash(), covered by four
  //           determinism tests
  //
  // The previous values (87, 42, 3.2, 12) measured nothing. The arrows were
  // worse than the numbers: they implied movement against a baseline that was
  // never recorded.
  { label: "Simulations Per Decision", value: 10000, suffix: "", desc: "Seeded Monte Carlo iterations across the full range of outcomes" },
  { label: "Probability Distributions", value: 8, suffix: "", desc: "Model uncertainty the way it actually behaves, not a single guess" },
  { label: "Advisory Frameworks", value: 10, suffix: "", desc: "Consensus engine returning GO, NO-GO or CONDITIONAL-GO with a disagreement map" },
  { label: "Reproducible", value: 100, suffix: "%", desc: "The same inputs always produce byte-identical output" },
];

// Neural Canvas Animation
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Device-scaled node count: identical density on capable desktops,
    // auto-reduced on mobile / low-core devices so it never janks.
    const nodeCountForDevice = () => {
      const w = window.innerWidth;
      const cores = (navigator as Navigator).hardwareConcurrency ?? 4;
      if (w < 640) return 90;
      if (w < 1024 || cores <= 4) return 160;
      return 250;
    };

    let animationFrameId = 0;
    let running = false;
    let NODES = nodeCountForDevice();
    const LINK_DIST = 220;
    const FLOW_SPEED = 0.3;
    let nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      blinkPhase: number;
    }> = [];

    function initNodes() {
      nodes = [];
      if (!canvas) return;
      for (let i = 0; i < NODES; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: -FLOW_SPEED * (0.8 + Math.random() * 0.4),
          vy: (Math.random() - 0.5) * 0.2,
          r: 1 + Math.random() * 2,
          blinkPhase: Math.random() * Math.PI * 2,
        });
      }
    }

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      NODES = nodeCountForDevice();
      initNodes();
      if (prefersReduced) drawFrame(); // keep the static frame in sync on resize
    };

    function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    let t = 0;
    function drawFrame() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = dist(a, b);
          if (d < LINK_DIST) {
            const strength = 1 - d / LINK_DIST;
            const pulse = 0.7 + 0.3 * Math.sin(t * 0.5 + (a.blinkPhase + b.blinkPhase));
            ctx.strokeStyle = `rgba(0,200,255,${0.45 * strength * pulse})`;
            ctx.lineWidth = 0.8 + 2.0 * strength;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const blink = 0.5 + 0.5 * Math.sin(t + n.blinkPhase);
        const alpha = 0.2 + 0.8 * blink;
        ctx.beginPath();
        ctx.fillStyle = `rgba(180,240,255,${alpha})`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 60fps lock — cap the loop so it never runs faster than needed.
    const FRAME_MS = 1000 / 60;
    let last = 0;
    const render = (now: number) => {
      if (!running) return;
      animationFrameId = requestAnimationFrame(render);
      if (now - last < FRAME_MS) return;
      last = now;
      t += 0.05;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -50) {
          n.x = canvas!.width + 50;
          n.y = Math.random() * canvas!.height;
        }
      }
      drawFrame();
    };

    const start = () => {
      if (running || prefersReduced) return;
      running = true;
      last = 0;
      animationFrameId = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
    };

    // Pause when the tab is hidden or the canvas scrolls off-screen.
    let onScreen = true;
    const evaluate = () => {
      if (document.visibilityState === "visible" && onScreen) start();
      else stop();
    };
    const onVisibility = () => evaluate();

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        evaluate();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    if (prefersReduced) {
      drawFrame(); // static, on-brand frame — present but not animating
    } else {
      evaluate();
    }

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.7,
      }}
    />
  );
}

// Demo video controls — shared by mouse hover and keyboard focus (a11y)
function playDemo(container: HTMLElement) {
  const video = container.querySelector("video");
  if (!video) return;
  video.muted = false;
  video.play().catch(() => {
    video.muted = true;
    video.play();
  });
}
function stopDemo(container: HTMLElement) {
  const video = container.querySelector("video");
  if (!video) return;
  video.pause();
  video.currentTime = 0;
  video.muted = true;
}

// Animated Number Component
function AnimatedNumber({ value, precision = 0, suffix = "" }: { value: number; precision?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const spring = useSpring(0, { damping: 100, stiffness: 100, mass: 3 });

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [spring, value, isInView]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        // Grouped thousands: toFixed() alone rendered the iteration count as
        // "10000", which reads as a raw dump rather than a figure.
        ref.current.textContent = `${latest.toLocaleString("en-US", {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        })}${suffix}`;
      }
    });
  }, [spring, precision, suffix]);

  return <span ref={ref}>0</span>;
}

export default function Home() {
  usePageMeta({
    title: "BrainPower AI — The Operating System for Decisions",
    description: "BrainPower AI is a structured intelligence system that helps individuals and teams simulate, visualize, and understand decisions before they are made. Not a chatbot — a Decision Intelligence System.",
  });
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0b1e", color: "white" }}>
      {/* Neural Canvas Background */}
      <NeuralCanvas />

      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ minHeight: "100vh", zIndex: 1, padding: "2rem 1rem" }}
      >
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight"
            style={{ textShadow: "0 2px 15px rgba(0,0,0,0.5)" }}
          >
            <span className="gradient-brand-text">
              BrainPower AI
            </span>
            <br />
            <span className="text-white">The Operating System for Decisions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl font-semibold mt-4 mb-2"
            style={{ color: "#00d4ff" }}
          >
            Structured Intelligence. Simulated Futures. Semi-3D Visual Decisions.
          </motion.p>

          {/* Hero Images Row */}
          <div className="relative z-10 flex w-full justify-center items-center gap-1 sm:gap-2 md:gap-4 my-8 pointer-events-none"
            style={{ height: "clamp(180px, 35vw, 420px)" }}>
            {/* Left phone - real app screenshot, tilted left */}
            <div className="hidden sm:flex items-end justify-center" style={{
              width: "clamp(70px, 12vw, 175px)",
              transform: "rotate(-14deg) translateY(8px)",
              transformOrigin: "bottom center",
              opacity: 0.70,
              filter: "drop-shadow(0 0 22px rgba(0,212,255,0.3))"
            }}>
              <img
                src={IMAGES.phoneLeft}
                alt="BrainPower AI - Decision Intelligence System"
                style={{ width: "100%", objectFit: "contain", borderRadius: "22px" }}
              />
            </div>
            {/* Left main - Robot */}
            <div style={{ width: "clamp(120px, 28vw, 320px)" }}>
              <img
                src={IMAGES.heroLeft}
                alt="AI Robot"
                style={{ width: "100%", objectFit: "contain" }}
              />
            </div>
            {/* Right main - Neural Head */}
            <div style={{ width: "clamp(120px, 28vw, 320px)" }}>
              <img
                src={IMAGES.heroRight}
                alt="Neural AI Head"
                style={{ width: "100%", objectFit: "contain" }}
              />
            </div>
            {/* Right phone - real app screenshot, tilted right */}
            <div className="hidden sm:flex items-end justify-center" style={{
              width: "clamp(70px, 12vw, 175px)",
              transform: "rotate(14deg) translateY(8px)",
              transformOrigin: "bottom center",
              opacity: 0.70,
              filter: "drop-shadow(0 0 22px rgba(178,75,243,0.3))"
            }}>
              <img
                src={IMAGES.phoneRight}
                alt="BrainPower AI - Intelligence Layers"
                style={{ width: "100%", objectFit: "contain", borderRadius: "22px" }}
              />
            </div>
          </div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mx-auto mb-10 rounded-lg p-3"
            style={{ backgroundColor: "rgba(44, 76, 156, 0.3)", backdropFilter: "blur(2px)" }}
          >
            <p className="text-lg md:text-xl px-3" style={{ color: "#c084fc", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
              Enhance clarity, structure complex thinking, and explore decisions through intelligent simulation.
            </p>
            <p className="text-sm md:text-base px-3 mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              BrainPower AI is not a chatbot. It is not a productivity tool. It is a structured intelligence system designed to help users simulate, visualize, and understand decisions before they are made.
            </p>
          </motion.div>

          {/* Why BrainPower AI? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mx-auto mt-6 mb-8 max-w-3xl"
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#00d4ff" }}>
              Why BrainPower AI?
            </p>
            <div className="rounded-xl border border-white/25 overflow-hidden">
              <table className="w-full table-fixed text-xs sm:text-sm border-collapse">
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.35)" }}>
                    <th className="text-left align-top py-3 px-2 sm:px-4 text-gray-300 font-medium w-[22%] border-r border-white/20"></th>
                    <th className="text-center align-top py-3 px-2 sm:px-4 text-gray-200 font-semibold break-words border-r border-white/20">Traditional Analysis</th>
                    <th className="text-center align-top py-3 px-2 sm:px-4 text-gray-200 font-semibold break-words border-r border-white/20">Generative AI</th>
                    <th className="text-center align-top py-3 px-2 sm:px-4 font-semibold break-words" style={{ color: "#00d4ff" }}>BrainPower AI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Output", "Static Reports", "Conversational Responses", "Decision Intelligence"],
                    ["Analysis", "Historical Analysis", "Information Generation", "Future Simulation"],
                    ["Method", "Workshops", "Q&A", "Structured Frameworks"],
                    ["Visualization", "Dashboards", "Text Interaction", "Interactive 3D Visualization"],
                    ["Purpose", "Information", "Content Creation", "Strategic Decision Support"],
                  ].map(([label, col1, col2, col3], i) => (
                    <tr key={label} style={{ borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.18)" : "none", backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <td className="py-2.5 px-2 sm:px-4 align-top text-gray-300 font-medium break-words border-r border-white/20">{label}</td>
                      <td className="py-2.5 px-2 sm:px-4 align-top text-center text-gray-200 break-words border-r border-white/20">{col1}</td>
                      <td className="py-2.5 px-2 sm:px-4 align-top text-center text-gray-200 break-words border-r border-white/20">{col2}</td>
                      <td className="py-2.5 px-2 sm:px-4 align-top text-center font-semibold text-white break-words">{col3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <a href="#concepts">
              <Button
                size="lg"
                className="w-48 btn-glow-cyan"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0099bb)",
                  color: "#0a0b1e",
                  fontWeight: "bold",
                }}
              >
                Explore Concepts
              </Button>
            </a>
            <Link href="/investors">
              <Button
                size="lg"
                className="w-48 btn-glow-purple"
                style={{
                  background: "linear-gradient(135deg, #b24bf3, #7c3aed)",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                For Investors
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-48 transition-all duration-300"
                style={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                <Lock className="mr-2 h-4 w-4" />
                Admin Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="relative py-16" style={{ zIndex: 1, backgroundColor: "rgba(10,11,30,0.8)" }}>
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #00d4ff, #b24bf3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            See BrainPower AI in Action
          </motion.h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
            Discover how structured reasoning, simulation, and semi-3D visual intelligence come together to guide better decisions.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mx-auto rounded-2xl overflow-hidden relative group glow-cyan-lg"
            role="button"
            tabIndex={0}
            aria-label="Play the BrainPower AI product demo video with sound. Press Enter or Space to toggle, or hover with a mouse."
            style={{
              maxWidth: "800px",
              border: "1px solid rgba(0,212,255,0.3)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => playDemo(e.currentTarget)}
            onMouseLeave={(e) => stopDemo(e.currentTarget)}
            onFocus={(e) => playDemo(e.currentTarget)}
            onBlur={(e) => stopDemo(e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const v = e.currentTarget.querySelector("video");
                if (v?.paused) playDemo(e.currentTarget);
                else stopDemo(e.currentTarget);
              }
            }}
          >
            <video
              src={VIDEO_URL}
              muted
              playsInline
              preload="metadata"
              style={{ width: "100%", display: "block" }}
            />
            {/* Hover overlay hint */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0"
              style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            >
              <div
                className="flex flex-col items-center gap-2"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 72,
                    height: 72,
                    background: "rgba(0,212,255,0.2)",
                    border: "2px solid rgba(0,212,255,0.6)",
                    boxShadow: "0 0 30px rgba(0,212,255,0.4)",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.85rem", color: "rgba(0,212,255,0.9)", letterSpacing: "0.05em" }}>
                  Hover or press Enter to play
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BrainPower Advisory Board™ */}
      <section className="relative py-16" style={{ zIndex: 1, backgroundColor: "rgba(10,11,30,0.9)" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#b24bf3" }}>
              Major Differentiator
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              BrainPower Advisory Board™
            </h2>
            <p className="text-base md:text-lg text-gray-300 mb-3 max-w-2xl mx-auto" style={{ fontStyle: "italic" }}>
              Pressure-test decisions through multiple strategic perspectives.
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              BrainPower Advisory Board™ evaluates decisions through investment, strategy, innovation, operations, risk, technology, and customer-impact lenses. The system identifies blind spots, surfaces hidden assumptions, highlights risks and opportunities, and generates consensus analysis before execution.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Metrics Section */}
      <section className="relative py-16" style={{ zIndex: 1 }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className="text-5xl md:text-7xl font-bold tabular-nums text-glow-stat"
                  style={{ color: "#00d4ff" }}
                >
                  <AnimatedNumber value={metric.value} precision={metric.precision} suffix={metric.suffix} />
                </div>
                <p className="mt-4 text-base md:text-lg font-semibold text-white">{metric.label}</p>
                <p className="mt-1.5 text-xs md:text-sm text-gray-300 max-w-[200px] mx-auto">{metric.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Concepts Section */}
      <section id="concepts" className="relative py-16" style={{ zIndex: 1 }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl text-center mx-auto mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold tracking-tighter sm:text-5xl text-white"
            >
              Conceptual Foundations
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {concepts.map((concept, index) => (
              <motion.div
                key={concept.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link href={`/concepts/${concept.slug}`}>
                  <Card
                    className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(0,212,255,0.2)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={concept.image}
                          alt={concept.title}
                          loading="lazy"
                          decoding="async"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: "linear-gradient(to top, rgba(10,11,30,0.8), transparent)" }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <CardTitle className="text-xl font-semibold mb-2 text-white">{concept.title}</CardTitle>
                      <CardDescription className="flex-grow text-gray-400">{concept.description}</CardDescription>
                      <div className="mt-4 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#00d4ff" }}>
                        Learn more <ArrowRight className="inline-block h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-12 text-center"
        style={{ zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} BrainPower AI. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <a href="#concepts" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
            Explore Concepts
          </a>
          <Link href="/investors" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
            For Investors
          </Link>
          <AdminLoginDialog />
        </div>
        <p className="mt-6 text-xs text-gray-500">
          Part of the{" "}
          <a href="https://smarhinkerz.com" className="hover:text-[#7dd3fc] transition-colors underline-offset-2 hover:underline">
            SmarThinkerz Unified Intelligence Hub
          </a>
        </p>
      </footer>
    </div>
  );
}

function AdminLoginDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      const adminRoles = ["admin", "super_admin", "content_manager", "investor_admin"];
      let role = "user";
      try {
        const result = await utils.auth.getRoleByEmail.fetch({ email });
        role = result.role;
      } catch {
        // default fallback
      }
      setOpen(false);
      setLocation(adminRoles.includes(role) ? "/admin" : "/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-gray-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          Admin Login
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0d0e24] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent">
            Admin Login
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in to access the admin dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-gray-300">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="bg-[#07081a] border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-gray-300">Password</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="bg-[#07081a] border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full text-black font-semibold"
            style={{ background: "linear-gradient(135deg, #00d4ff, #b24bf3)" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <div className="text-center text-xs text-gray-500 pt-2">
            <Link href="/forgot-password" className="hover:text-cyan-400 transition-colors">
              Forgot password?
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
