import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Network, Layers, GitBranch, RefreshCw } from "lucide-react";
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
            ctx.strokeStyle = `rgba(0,212,255,${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.5)";
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

const principles = [
  {
    icon: <Network className="w-6 h-6" />,
    title: "Interconnectedness",
    body: "Every element in a system is connected to others. Changing one part ripples through the whole. Systemic thinkers map these connections before acting.",
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Emergent Properties",
    body: "Systems produce outcomes that no single part can produce alone. Traffic jams, market crashes, and breakthroughs all emerge from interactions — not individual components.",
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: "Feedback Loops",
    body: "Reinforcing loops amplify change; balancing loops resist it. Identifying which loops dominate a situation reveals why problems persist or accelerate.",
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Non-Linearity",
    body: "Small inputs can produce large outputs — and vice versa. Linear thinking fails in complex systems. Leverage points are rarely where intuition suggests.",
  },
];

const practices = [
  { step: "01", title: "Map the System", desc: "Draw the actors, resources, and flows before forming any opinion. Incomplete maps produce incomplete solutions." },
  { step: "02", title: "Identify Feedback", desc: "Ask: what reinforces this pattern? What limits it? Feedback loops explain why problems are self-sustaining." },
  { step: "03", title: "Find Leverage Points", desc: "Donella Meadows identified 12 places to intervene in a system. The most powerful are often the least obvious." },
  { step: "04", title: "Test Assumptions", desc: "Every mental model of a system is a hypothesis. Run small experiments to validate before committing resources." },
];

export default function SystemicThinking() {
  usePageMeta({
    title: "Systemic Thinking — BrainPower AI Concepts",
    description: "See the whole, not just the parts. Understand how components interact, how feedback shapes outcomes, and where real leverage lives.",
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "Systemic Thinking: See the Whole, Not Just the Parts",
        "description": "Understand how components interact, how feedback shapes outcomes, and where real leverage lives. A guide to systemic thinking from BrainPower AI.",
        "url": "https://brainpowerai.com/concepts/systemic-thinking",
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
          { "@type": "ListItem", "position": 2, "name": "Systemic Thinking", "item": "https://brainpowerai.com/concepts/systemic-thinking" }
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
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#00d4ff" }}>Concept 01</p>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span style={{ color: "#00d4ff" }}>Systemic</span> Thinking
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            See the whole, not just the parts. Understand how components interact, how feedback shapes outcomes, and where real leverage lives.
          </p>
        </motion.div>
      </section>

      {/* Principles */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Core <span style={{ color: "#00d4ff" }}>Principles</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p, i) => (
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

      {/* How to Practice */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          How to <span style={{ color: "#b24bf3" }}>Practice It</span>
        </motion.h2>
        <div className="space-y-6">
          {practices.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex gap-6 items-start"
            >
              <span className="text-4xl font-black shrink-0" style={{ color: "rgba(0,212,255,0.25)" }}>{p.step}</span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="relative z-10 px-6 py-16 max-w-3xl mx-auto text-center">
        <motion.blockquote
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl md:text-2xl italic text-gray-300 leading-relaxed"
          style={{ borderLeft: "4px solid #00d4ff", paddingLeft: "1.5rem", textAlign: "left" }}
        >
          "You can never understand a system by looking at its parts in isolation. The whole is always more than the sum."
          <footer className="mt-4 text-sm not-italic" style={{ color: "#00d4ff" }}>— Donella Meadows, <em>Thinking in Systems</em></footer>
        </motion.blockquote>
      </section>

      {/* Navigation to other concepts */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <h3 className="text-center text-sm uppercase tracking-widest mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Explore Other Concepts</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { label: "Cognitive Biases", href: "/concepts/cognitive-biases" },
            { label: "Decision Intelligence", href: "/concepts/decision-intelligence" },
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
            <a href="https://smarthinkerz.com" className="hover:text-[#7dd3fc] transition-colors underline-offset-2 hover:underline">
              SmarThinkerz Unified Intelligence Hub
            </a>
          </p>
        </footer>
    </div>
  );
}
