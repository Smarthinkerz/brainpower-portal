import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, AlertTriangle, Brain, Shield } from "lucide-react";
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
            ctx.strokeStyle = `rgba(178,75,243,${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(178,75,243,0.5)";
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

const biases = [
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Confirmation Bias",
    body: "We seek information that confirms what we already believe and discount evidence that contradicts it. This is the most pervasive bias in decision-making.",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Availability Heuristic",
    body: "We judge probability by how easily examples come to mind. Vivid, recent, or emotionally charged events feel more likely than statistics suggest.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Dunning-Kruger Effect",
    body: "Low competence produces high confidence. The less we know about a domain, the less we understand what we don't know — creating dangerous blind spots.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Sunk Cost Fallacy",
    body: "Past investments — time, money, effort — should not influence future decisions. Yet we consistently let them. Rational decisions are forward-looking only.",
  },
];

const debiasing = [
  { step: "01", title: "Name the Bias", desc: "Awareness is the first defence. When you catch yourself rationalising, ask: which bias might be operating here?" },
  { step: "02", title: "Seek Disconfirmation", desc: "Actively look for evidence that contradicts your current view. Ask: what would change my mind? Then go find it." },
  { step: "03", title: "Use Pre-Mortems", desc: "Before committing, imagine the decision has failed. Work backwards to identify what went wrong. This surfaces risks confirmation bias hides." },
  { step: "04", title: "Slow Down", desc: "Most biases operate in fast, automatic thinking. Introducing deliberate pause — even 10 minutes — activates slower, more rational processing." },
];

export default function CognitiveBiases() {
  usePageMeta({
    title: "Cognitive Biases — BrainPower AI Concepts",
    description: "Identify the blind spots hardwired into human judgment. Understanding cognitive biases is the first step to thinking more clearly and deciding more rationally.",
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "Cognitive Biases: Identify the Blind Spots Hardwired into Human Judgment",
        "description": "Understanding cognitive biases is the first step to thinking more clearly and deciding more rationally. A guide to key biases and de-biasing strategies from BrainPower AI.",
        "url": "https://brainpowerai.com/concepts/cognitive-biases",
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
          { "@type": "ListItem", "position": 2, "name": "Cognitive Biases", "item": "https://brainpowerai.com/concepts/cognitive-biases" }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#0a0b1e", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NeuralCanvas />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(178,75,243,0.2)" }}>
        <Link href="/">
          <span className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: "#b24bf3" }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </span>
        </Link>
        <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>BrainPower AI · Concepts</span>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#b24bf3" }}>Concept 02</p>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span style={{ color: "#b24bf3" }}>Cognitive</span> Biases
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            Identify the blind spots hardwired into human judgment. Understanding biases is the first step to thinking more clearly and deciding more rationally.
          </p>
        </motion.div>
      </section>

      {/* Biases */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Key <span style={{ color: "#b24bf3" }}>Biases to Know</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {biases.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(178,75,243,0.25)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3" style={{ color: "#b24bf3" }}>
                    {b.icon}
                    <h3 className="text-lg font-semibold text-white">{b.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{b.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* De-biasing */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          De-biasing <span style={{ color: "#00d4ff" }}>Strategies</span>
        </motion.h2>
        <div className="space-y-6">
          {debiasing.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex gap-6 items-start"
            >
              <span className="text-4xl font-black shrink-0" style={{ color: "rgba(178,75,243,0.25)" }}>{d.step}</span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{d.title}</h3>
                <p className="text-gray-400 leading-relaxed">{d.desc}</p>
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
          style={{ borderLeft: "4px solid #b24bf3", paddingLeft: "1.5rem" }}
        >
          "The confidence people have in their beliefs is not a measure of the quality of evidence but of the coherence of the story the mind has managed to construct."
          <footer className="mt-4 text-sm not-italic" style={{ color: "#b24bf3" }}>— Daniel Kahneman, <em>Thinking, Fast and Slow</em></footer>
        </motion.blockquote>
      </section>

      {/* Navigation to other concepts */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <h3 className="text-center text-sm uppercase tracking-widest mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Explore Other Concepts</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { label: "Systemic Thinking", href: "/concepts/systemic-thinking" },
            { label: "Decision Intelligence", href: "/concepts/decision-intelligence" },
            { label: "Mental Models", href: "/concepts/mental-models" },
          ].map((c) => (
            <Link key={c.href} href={c.href}>
              <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
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
