import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Compass, Puzzle, Lightbulb, Map } from "lucide-react";
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
            ctx.strokeStyle = `rgba(178,75,243,${0.1 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(178,75,243,0.45)";
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

const models = [
  {
    icon: <Compass className="w-6 h-6" />,
    title: "First Principles Thinking",
    body: "Break problems down to their fundamental truths, then reason up from there. Elon Musk used this to rethink rocket manufacturing from scratch.",
  },
  {
    icon: <Puzzle className="w-6 h-6" />,
    title: "Inversion",
    body: "Instead of asking how to succeed, ask how to fail — then avoid it. Charlie Munger calls inversion one of the most powerful thinking tools available.",
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Second-Order Thinking",
    body: "Ask: and then what? Every action has consequences, and those consequences have consequences. Most people stop at first-order effects.",
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "The Map Is Not the Territory",
    body: "Our models of reality are simplifications. Treating them as reality leads to blind spots. Good thinkers hold their models loosely and update them constantly.",
  },
];

const howToUse = [
  { step: "01", title: "Build a Latticework", desc: "Charlie Munger's advice: collect mental models from many disciplines. The more models you have, the more patterns you can recognise." },
  { step: "02", title: "Match Model to Problem", desc: "Different problems call for different models. Ask: which lens is most useful here? Resist applying your favourite model to everything." },
  { step: "03", title: "Combine Models", desc: "The most powerful insights come from applying multiple models simultaneously. Overlapping frameworks reveal what single models miss." },
  { step: "04", title: "Update Constantly", desc: "A mental model that no longer fits reality is worse than no model at all. Treat every model as provisional and revise it when evidence demands." },
];

export default function MentalModels() {
  usePageMeta({
    title: "Mental Models — BrainPower AI Concepts",
    description: "Mental models are the lenses through which we interpret reality. The richer your collection, the sharper your thinking and the better your decisions.",
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "Mental Models: Expand How Problems Are Framed",
        "description": "Mental models are the lenses through which we interpret reality. The richer your collection, the sharper your thinking. Explore essential mental models from BrainPower AI.",
        "url": "https://brainpowerai.com/concepts/mental-models",
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
          { "@type": "ListItem", "position": 2, "name": "Mental Models", "item": "https://brainpowerai.com/concepts/mental-models" }
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
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#b24bf3" }}>Concept 04</p>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span style={{ color: "#b24bf3" }}>Mental</span> Models
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            Expand how problems are framed. Mental models are the lenses through which we interpret reality — and the richer your collection, the sharper your thinking.
          </p>
        </motion.div>
      </section>

      {/* Models */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Essential <span style={{ color: "#b24bf3" }}>Models</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(178,75,243,0.25)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3" style={{ color: "#b24bf3" }}>
                    {m.icon}
                    <h3 className="text-lg font-semibold text-white">{m.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{m.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How to Use */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          How to <span style={{ color: "#00d4ff" }}>Use Them</span>
        </motion.h2>
        <div className="space-y-6">
          {howToUse.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex gap-6 items-start"
            >
              <span className="text-4xl font-black shrink-0" style={{ color: "rgba(178,75,243,0.25)" }}>{h.step}</span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{h.title}</h3>
                <p className="text-gray-400 leading-relaxed">{h.desc}</p>
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
          "I have just one simple trick: I try to think the way the best thinkers think. I try to have a latticework of mental models in my head."
          <footer className="mt-4 text-sm not-italic" style={{ color: "#b24bf3" }}>— Charlie Munger</footer>
        </motion.blockquote>
      </section>

      {/* Navigation to other concepts */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <h3 className="text-center text-sm uppercase tracking-widest mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Explore Other Concepts</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { label: "Systemic Thinking", href: "/concepts/systemic-thinking" },
            { label: "Cognitive Biases", href: "/concepts/cognitive-biases" },
            { label: "Decision Intelligence", href: "/concepts/decision-intelligence" },
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
