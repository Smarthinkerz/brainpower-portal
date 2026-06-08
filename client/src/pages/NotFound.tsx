import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Brain } from "lucide-react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const NODES = 80;
    const LINK_DIST = 200;
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      nodes = Array.from({ length: NODES }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2 + 1,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
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
            ctx.strokeStyle = `rgba(178,75,243,${0.08 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.35)";
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative flex items-center justify-center" style={{ backgroundColor: "#0a0b1e" }}>
      <NeuralCanvas />

      <div className="relative z-10 text-center px-6 max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(178,75,243,0.15)",
                border: "2px solid rgba(178,75,243,0.4)",
                boxShadow: "0 0 40px rgba(178,75,243,0.2)",
              }}
            >
              <Brain className="h-12 w-12" style={{ color: "#b24bf3" }} />
            </div>
          </div>

          <h1
            className="text-8xl font-extrabold mb-4"
            style={{
              background: "linear-gradient(135deg, #00d4ff 0%, #b24bf3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 80px rgba(0,212,255,0.3)",
            }}
          >
            404
          </h1>

          <h2 className="text-2xl font-bold text-white mb-3">
            Neural Path Not Found
          </h2>

          <p className="text-gray-400 mb-10 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            <br />
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/")}
              size="lg"
              className="transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #00d4ff, #0099bb)",
                color: "#0a0b1e",
                fontWeight: "bold",
                boxShadow: "0 0 20px rgba(0,212,255,0.4)",
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>

            <Button
              onClick={() => window.history.back()}
              size="lg"
              variant="outline"
              className="transition-all duration-300"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "white",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} BrainPower AI
          </p>
        </motion.div>
      </div>
    </div>
  );
}
