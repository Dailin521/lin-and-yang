import { useEffect, useRef } from "react";
type StarPoint = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  color: string;
  depth: number;
};
type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
};
export default function Starfield({ enabled }: { enabled: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      clock = 0,
      nextMeteor = performance.now() + 3500;
    let stars: StarPoint[] = [],
      dust: Dust[] = [],
      meteors: { x: number; y: number; life: number }[] = [];
    const pointer = { x: -1000, y: -1000 };
    const colors = ["#b5a0ff", "#78e7ff", "#f1a4e3", "#f6f4ff"];
    function resize() {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      el!.width = width * dpr;
      el!.height = height * dpr;
      el!.style.width = width + "px";
      el!.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from(
        {
          length: Math.min(
            width < 700 ? 85 : 170,
            Math.round((width * height) / 7000),
          ),
        },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.4 + Math.random() * 1.35,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.8,
          color: colors[Math.floor(Math.random() * 4)],
          depth: 0.2 + Math.random() * 0.8,
        }),
      );
      if (!enabled) draw(0);
    }
    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height);
      stars.forEach((s) => {
        let x = s.x,
          y = s.y;
        const dx = pointer.x - x,
          dy = pointer.y - y,
          d = Math.hypot(dx, dy);
        if (enabled && d < 160 && d > 0) {
          const f = (160 - d) / 160;
          x -= dx * f * 0.08 * s.depth;
          y -= dy * f * 0.08 * s.depth;
        }
        const alpha = enabled
          ? 0.35 + (Math.sin(t * 0.0007 * s.speed + s.phase) + 1) * 0.28
          : 0.65;
        ctx!.globalAlpha = alpha;
        ctx!.shadowColor = s.color;
        ctx!.shadowBlur = s.size > 1.2 ? 7 : 0;
        ctx!.fillStyle = s.color;
        ctx!.beginPath();
        ctx!.arc(x, y, s.size, 0, Math.PI * 2);
        ctx!.fill();
        if (s.size > 1.5) {
          ctx!.fillRect(x - 3, y - 0.35, 6, 0.7);
          ctx!.fillRect(x - 0.35, y - 3, 0.7, 6);
        }
      });
      ctx!.shadowBlur = 0;
      ctx!.globalAlpha = 1;
      meteors = meteors.filter((m) => m.life > 0);
      meteors.forEach((m) => {
        const g = ctx!.createLinearGradient(m.x, m.y, m.x - 110, m.y - 40);
        g.addColorStop(0, `rgba(212,235,255,${m.life})`);
        g.addColorStop(1, "transparent");
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(m.x - 110, m.y - 40);
        ctx!.stroke();
        m.x += 11;
        m.y += 4;
        m.life -= 0.018;
      });
      dust = dust.filter((p) => p.life > 0);
      dust.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 0.027;
        ctx!.globalAlpha = p.life;
        ctx!.fillStyle = p.color;
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = 6;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      });
      ctx!.globalAlpha = 1;
      ctx!.shadowBlur = 0;
    }
    function tick(t: number) {
      frame = requestAnimationFrame(tick);
      if (t - last < 32) return;
      last = t;
      clock = t;
      if (t > nextMeteor) {
        meteors.push({
          x: Math.random() * width * 0.7 + width * 0.2,
          y: Math.random() * height * 0.35,
          life: 0.85,
        });
        nextMeteor = t + 6500 + Math.random() * 7000;
      }
      draw(t);
    }
    const move = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const leave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };
    const burst = (e: PointerEvent) => {
      if (
        !enabled ||
        !(e.target instanceof Element) ||
        !e.target.closest("a,button") ||
        e.target.closest(":disabled")
      )
        return;
      dust = dust.slice(-60);
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12;
        const v = 1 + Math.random() * 2.5;
        dust.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 1,
          size: 1 + Math.random() * 2,
          color: colors[i % 4],
        });
      }
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && enabled) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    resize();
    if (enabled && !document.hidden) frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", burst, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", burst);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled]);
  return (
    <>
      <div className="nebula" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <canvas ref={canvas} className="starfield" aria-hidden="true" />
    </>
  );
}
