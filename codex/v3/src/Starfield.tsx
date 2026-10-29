import { useEffect, useRef } from "react";

type StarPoint = {
  x: number;
  y: number;
  size: number;
  phase: number;
  depth: number;
  color: number;
};
type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  duration: number;
  size: number;
  color: number;
  spark: boolean;
};
type Ripple = { x: number; y: number; age: number; radius: number };
type Meteor = {
  x: number;
  y: number;
  age: number;
  duration: number;
  length: number;
  speed: number;
  angle: number;
  color: number;
};
const colors = ["#a499ff", "#65eaff", "#fface5", "#fff0ca"];

export default function Starfield({ enabled }: { enabled: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const feedback = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current,
      fx = feedback.current;
    const sky = el?.getContext("2d"),
      front = fx?.getContext("2d");
    if (!el || !fx || !sky || !front) return;
    const ctx = sky,
      effect = front;
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      time = 0,
      nextMeteor = 1200;
    let stars: StarPoint[] = [],
      dust: Dust[] = [],
      meteors: Meteor[] = [],
      ripples: Ripple[] = [];
    let dirty = false,
      lastTrail = 0,
      lastHover = 0;
    let press: { x: number; y: number; time: number; id: number } | null = null;
    const pointer = { x: -1000, y: -1000, smoothX: -1000, smoothY: -1000 };
    // Small cached sprites avoid expensive shadow blurs for every star, every frame.
    const glows = colors.map((color) => {
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = 64;
      const pen = sprite.getContext("2d")!;
      const glow = pen.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.07, color);
      glow.addColorStop(0.22, color + "80");
      glow.addColorStop(1, color + "00");
      pen.fillStyle = glow;
      pen.fillRect(0, 0, 64, 64);
      return sprite;
    });
    function sparkle(
      pen: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
    ) {
      pen.beginPath();
      pen.moveTo(x, y - size);
      pen.quadraticCurveTo(x + size * 0.16, y - size * 0.16, x + size, y);
      pen.quadraticCurveTo(x + size * 0.16, y + size * 0.16, x, y + size);
      pen.quadraticCurveTo(x - size * 0.16, y + size * 0.16, x - size, y);
      pen.quadraticCurveTo(x - size * 0.16, y - size * 0.16, x, y - size);
      pen.fill();
    }
    function resize() {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      for (const [surface, pen] of [
        [el!, ctx],
        [fx!, effect],
      ] as const) {
        surface.width = Math.round(width * dpr);
        surface.height = Math.round(height * dpr);
        surface.style.width = width + "px";
        surface.style.height = height + "px";
        pen.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      stars = Array.from(
        {
          length: Math.min(
            width < 700 ? 85 : 220,
            Math.round((width * height) / 4300),
          ),
        },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.35 + Math.random() * 1.25,
          phase: Math.random() * Math.PI * 2,
          depth: 0.2 + Math.random() * 0.8,
          color: Math.floor(Math.random() * 4),
        }),
      );
      dust = [];
      ripples = [];
      dirty = false;
      drawSky(0);
    }
    function drawSky(dt: number) {
      ctx.clearRect(0, 0, width, height);
      if (enabled && pointer.x >= 0) {
        pointer.smoothX += (pointer.x - pointer.smoothX) * 0.12;
        pointer.smoothY += (pointer.y - pointer.smoothY) * 0.12;
        const glow = ctx.createRadialGradient(
          pointer.smoothX,
          pointer.smoothY,
          0,
          pointer.smoothX,
          pointer.smoothY,
          150,
        );
        glow.addColorStop(0, "#a68aff12");
        glow.addColorStop(1, "#a68aff00");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }
      stars.forEach((s) => {
        const parallax = enabled && pointer.x >= 0;
        const x =
          s.x +
          (parallax ? (pointer.smoothX - width / 2) * 0.012 * s.depth : 0);
        const y =
          s.y +
          (parallax ? (pointer.smoothY - height / 2) * 0.01 * s.depth : 0) +
          (enabled ? Math.sin(time * 0.00015 + s.phase) * 3 * s.depth : 0);
        const shimmer = enabled
          ? 0.45 + (Math.sin(time * 0.001 + s.phase) + 1) * 0.24
          : 0.8;
        ctx.globalAlpha = shimmer;
        ctx.fillStyle = colors[s.color];
        if (s.size > 1.3)
          ctx.drawImage(
            glows[s.color],
            x - s.size * 5,
            y - s.size * 5,
            s.size * 10,
            s.size * 10,
          );
        ctx.beginPath();
        ctx.arc(x, y, s.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
        if (s.size > 1.46) {
          ctx.globalAlpha = shimmer * 0.65;
          sparkle(ctx, x, y, s.size * 3);
        }
      });
      meteors = meteors.filter((m) => m.age < m.duration);
      for (const m of meteors) {
        m.age += dt;
        if (m.age < 0) continue;
        const p = Math.min(1, m.age / m.duration),
          fade = Math.min(p * 7, 1) * Math.pow(1 - p, 0.7);
        const dx = Math.cos(m.angle),
          dy = Math.sin(m.angle),
          x = m.x + dx * m.speed * m.age,
          y = m.y + dy * m.speed * m.age;
        const tail = Math.min(m.length, m.age * m.speed);
        const gradient = ctx.createLinearGradient(
          x,
          y,
          x - dx * tail,
          y - dy * tail,
        );
        gradient.addColorStop(0, "#f9f5ff");
        gradient.addColorStop(0.18, colors[m.color]);
        gradient.addColorStop(0.65, "#b28cff70");
        gradient.addColorStop(1, "#b28cff00");
        ctx.globalAlpha = fade;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x - dy * 1.4, y + dx * 1.4);
        ctx.lineTo(x - dx * tail, y - dy * tail);
        ctx.lineTo(x + dy * 1.4, y - dx * 1.4);
        ctx.fill();
        ctx.globalAlpha = fade * 0.3;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - dx * tail, y - dy * tail);
        ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.drawImage(glows[m.color], x - 13, y - 13, 26, 26);
        ctx.fillStyle = "#ffffff";
        sparkle(ctx, x, y, 3.2);
      }
      ctx.globalAlpha = 1;
    }
    function drawFeedback(dt: number) {
      if (!dirty && !dust.length && !ripples.length) return;
      effect.clearRect(0, 0, width, height);
      dust = dust.filter((p) => p.age < p.duration);
      ripples = ripples.filter((r) => r.age < 850);
      for (const r of ripples) {
        r.age += dt;
        const p = Math.min(1, r.age / 850),
          radius = 5 + (1 - Math.pow(1 - p, 3)) * r.radius;
        effect.globalAlpha = (1 - p) * 0.5;
        effect.strokeStyle = "#d3b5ff";
        effect.lineWidth = 1;
        effect.beginPath();
        effect.ellipse(r.x, r.y, radius, radius * 0.68, -0.4, 0, Math.PI * 2);
        effect.stroke();
      }
      for (const p of dust) {
        p.age += dt;
        const life = Math.max(0, 1 - p.age / p.duration),
          step = dt / 16.67;
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vx *= Math.pow(0.975, step);
        p.vy *= Math.pow(0.975, step);
        effect.globalAlpha = life * life;
        effect.drawImage(
          glows[p.color],
          p.x - p.size * 4,
          p.y - p.size * 4,
          p.size * 8,
          p.size * 8,
        );
        effect.fillStyle = colors[p.color];
        if (p.spark) sparkle(effect, p.x, p.y, p.size * 1.8);
        else {
          effect.beginPath();
          effect.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
          effect.fill();
        }
      }
      effect.globalAlpha = 1;
      dirty = !!(dust.length || ripples.length);
    }
    function emit(x: number, y: number, count: number, burst = false) {
      if (!enabled || document.hidden) return;
      const cap = width < 700 ? 65 : 110;
      dust = dust.slice(-(cap - count));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4,
          speed = burst ? 1.2 + Math.random() * 3.3 : 0.3 + Math.random() * 0.9;
        dust.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (burst ? 0.35 : 0.7),
          age: 0,
          duration: burst
            ? 700 + Math.random() * 550
            : 450 + Math.random() * 350,
          size: burst ? 1.4 + Math.random() * 2.1 : 1 + Math.random(),
          color: i % 4,
          spark: burst && i % 3 === 0,
        });
      }
      if (burst) {
        ripples = ripples.slice(-2);
        ripples.push({ x, y, age: 0, radius: width < 700 ? 45 : 62 });
      }
      dirty = true;
      drawFeedback(0);
    }
    function tick(t: number) {
      frame = requestAnimationFrame(tick);
      if (t - last < 32) return;
      const dt = last ? Math.min(t - last, 64) : 33;
      last = t;
      time += dt;
      if (time >= nextMeteor) {
        const x = width * (0.08 + Math.random() * 0.56),
          y = height * (0.08 + Math.random() * 0.25);
        const meteor = {
          x,
          y,
          age: 0,
          duration: 1450,
          length: width < 700 ? 125 : 245,
          speed: width < 700 ? 0.28 : 0.46,
          angle: 0.35 + Math.random() * 0.15,
          color: Math.floor(Math.random() * 3),
        };
        meteors.push(meteor);
        // An occasional small companion follows the same path through the sky.
        if (width >= 700 && Math.random() > 0.5)
          meteors.push({
            ...meteor,
            x: x - 32,
            y: y + 35,
            age: -220,
            length: 120,
            duration: 1200,
          });
        nextMeteor = time + 4800 + Math.random() * 3000;
      }
      drawSky(dt);
      drawFeedback(dt);
    }
    function excluded(target: EventTarget | null) {
      return (
        !(target instanceof Element) ||
        !!target.closest(
          'input,textarea,select,[contenteditable="true"],:disabled,[aria-disabled="true"],.motionButton,dialog',
        )
      );
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (pointer.x < 0) {
        pointer.smoothX = e.clientX;
        pointer.smoothY = e.clientY;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (
        e.buttons === 0 &&
        !excluded(e.target) &&
        e.target instanceof Element &&
        e.target.closest(".orbitalScene,.destinationOrb") &&
        time - lastTrail > 80
      ) {
        emit(e.clientX, e.clientY, 1);
        lastTrail = time;
      }
    };
    const leave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
      press = null;
    };
    const down = (e: PointerEvent) => {
      press =
        e.isPrimary && e.button === 0 && !excluded(e.target)
          ? {
              x: e.clientX,
              y: e.clientY,
              time: performance.now(),
              id: e.pointerId,
            }
          : null;
    };
    const up = (e: PointerEvent) => {
      if (
        press &&
        press.id === e.pointerId &&
        performance.now() - press.time < 700 &&
        Math.hypot(e.clientX - press.x, e.clientY - press.y) < 10 &&
        !excluded(e.target)
      )
        emit(e.clientX, e.clientY, width < 700 ? 18 : 26, true);
      press = null;
    };
    const cancel = () => {
      press = null;
    };
    const keyboard = (e: MouseEvent) => {
      if (
        e.detail !== 0 ||
        excluded(e.target) ||
        !(e.target instanceof Element)
      )
        return;
      const control = e.target.closest("a,button");
      if (!control) return;
      const rect = control.getBoundingClientRect();
      emit(rect.left + rect.width / 2, rect.top + rect.height / 2, 18, true);
    };
    const hover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !(e.target instanceof Element)) return;
      const planet = e.target.closest(
        ".mainPlanet,.satellite,.planetDestination",
      );
      if (
        !planet ||
        (e.relatedTarget instanceof Node && planet.contains(e.relatedTarget)) ||
        time - lastHover < 350
      )
        return;
      emit(e.clientX, e.clientY, 7);
      lastHover = time;
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      document.documentElement.dataset.skyVisible = document.hidden
        ? "false"
        : "true";
      if (!document.hidden && enabled) {
        last = 0;
        frame = requestAnimationFrame(tick);
      } else {
        dust = [];
        ripples = [];
        effect.clearRect(0, 0, width, height);
      }
    };
    resize();
    visibility();
    window.addEventListener("resize", resize);
    if (enabled) {
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerdown", down, { passive: true });
      window.addEventListener("pointerup", up, { passive: true });
      window.addEventListener("pointercancel", cancel, { passive: true });
      window.addEventListener("click", keyboard, {
        passive: true,
        capture: true,
      });
      window.addEventListener("pointerover", hover, { passive: true });
      document.addEventListener("pointerleave", leave);
      document.addEventListener("visibilitychange", visibility);
    }
    return () => {
      cancelAnimationFrame(frame);
      effect.clearRect(0, 0, width, height);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("click", keyboard, true);
      window.removeEventListener("pointerover", hover);
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
      <canvas ref={feedback} className="cosmicFeedback" aria-hidden="true" />
    </>
  );
}
