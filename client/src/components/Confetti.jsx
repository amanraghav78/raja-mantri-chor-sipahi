import { useEffect, useRef } from "react";

// Struck-metal confetti: leaf gold, pale gold, bronze, copper, with the two
// jewel tones as accents. Reads as coins and foil rather than party plastic.
const COLORS = ["#d4af37", "#f5e7a3", "#b87333", "#cd8f4e", "#0b6e4f", "#7a1f2b"];

export default function Confetti({ burstKey }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!burstKey) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const particles = Array.from({ length: 110 }).map(() => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -9 - 3,
      size: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 22,
    }));

    const gravity = 0.32;
    const start = performance.now();
    let raf;

    function frame(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (elapsed < 2200) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }, [burstKey]);

  return <canvas ref={canvasRef} className="confetti-layer" />;
}
