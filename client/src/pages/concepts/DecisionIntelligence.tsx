import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Target, Scale, Zap, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const NODES = 120;
    const LINK_DIST = 180;
    let nodes: any[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      nodes = Array.from({ length: NODES }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = m.x - n.x, dy = m.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(0,212,255,${0.1 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.4)";
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

const pillars = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "Problem Framing",
    body: "The quality of a decision is bounded by the quality of the question. Reframing the problem — even slightly — can reveal options that were invisible before.",
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: "Trade-off Analysis",
    body: "Every decision involves giving something up. Decision intelligence makes trade-offs explicit, quantified where possible, and aligned with what actually matters.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Speed vs. Accuracy",
    body: "Not all decisions deserve the same deliberation. Knowing when to decide fast and when to slow down is itself a critical intelligence layer.",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Outcome Calibration",
    body: "Good decisions can produce bad outcomes — and vice versa. Decision intelligence separates process quality from outcome quality to enable genuine learning.",
  },
];

const framework = [
  { step: "01", title: "Define the Real Decision", desc: "Most people solve the wrong problem. Spend time clarifying what decision is actually being made before generating options." },
  { step: "02", title: "Identify What You Value", desc: "Decisions are only as good as the values they serve. Articulate what success looks like before evaluating options." },
  { step: "03", title: "Generate Multiple Options", desc: "The first option that comes to mind is rarely the best. Force at least three alternatives before evaluating any of them." },
  { step: "04", title: "Evaluate Under Uncertainty", desc: "Use scenario planning, expected value thinking, and sensitivity analysis to stress-test options before committing." },
];

export default function DecisionIntelligence() {
  usePageMeta({
    title: "Decision Intelligence — BrainPower AI Concepts",
    description: "A structured approach to making choices that are well-reasoned, values-aligned, and resilient under uncertainty. Explore the four pillars of decision intelligence.",
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "Decision Intelligence: Clarity When Decisions Carry Weight",
        "description": "A structured approach to making choices that are well-reasoned, values-aligned, and resilient under uncertainty. Explore the four pillars and decision framework from BrainPower AI.",
        "url": "https://brainpowerai.com/concepts/decision-intelligence",
        "isPartOf": {
          "@type": "WebSite",
          "name": "BrainPower AI",
          "url": "https://brainpowerai.com"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://brainpowerai.com/" },
          { "@type": "ListItem", "position": 2, "name": "Decision Intelligence", "item": "https://brainpowerai.com/concepts/decision-intelligence" }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#0a0b1e", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NeuralCanvas />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,212,255,0.15)" }}>
        <Link href="/">
          <span className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: "#00d4ff" }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </span>
        </Link>
        <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>BrainPower AI · Concepts</span>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#00d4ff" }}>Concept 03</p>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span style={{ color: "#00d4ff" }}>Decision</span> Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            Clarity when decisions carry weight. A structured approach to making choices that are well-reasoned, values-aligned, and resilient under uncertainty.
          </p>
        </motion.div>
      </section>

      {/* Pillars */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Four <span style={{ color: "#00d4ff" }}>Pillars</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3" style={{ color: "#00d4ff" }}>
                    {p.icon}
                    <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{p.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Framework */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          The <span style={{ color: "#b24bf3" }}>Decision Framework</span>
        </motion.h2>
        <div className="space-y-6">
          {framework.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex gap-6 items-start"
            >
              <span className="text-4xl font-black shrink-0" style={{ color: "rgba(0,212,255,0.25)" }}>{f.step}</span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="relative z-10 px-6 py-16 max-w-3xl mx-auto">
        <motion.blockquote
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl md:text-2xl italic text-gray-300 leading-relaxed"
          style={{ borderLeft: "4px solid #00d4ff", paddingLeft: "1.5rem" }}
        >
          "A good decision is the result of a good process, not a good outcome. Outcomes are partly luck. Process is entirely yours."
          <footer className="mt-4 text-sm not-italic" style={{ color: "#00d4ff" }}>— Annie Duke, <em>Thinking in Bets</em></footer>
        </motion.blockquote>
      </section>

      {/* Navigation to other concepts */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <h3 className="text-center text-sm uppercase tracking-widest mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Explore Other Concepts</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { label: "Systemic Thinking", href: "/concepts/systemic-thinking" },
            { label: "Cognitive Biases", href: "/concepts/cognitive-biases" },
            { label: "Mental Models", href: "/concepts/mental-models" },
          ].map((c) => (
            <Link key={c.href} href={c.href}>
              <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                {c.label} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} BrainPower AI. All rights reserved.</p>
          <p className="mt-4 text-xs text-gray-500">
            Part of the{" "}
            <a href="https://smarhinkerz.com" className="hover:text-[#7dd3fc] transition-colors underline-offset-2 hover:underline">
              SmarThinkerz Unified Intelligence Hub
            </a>
          </p>
        </footer>
    </div>
  );
}
