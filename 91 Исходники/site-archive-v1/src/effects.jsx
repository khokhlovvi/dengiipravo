// Эффекты в духе Magic UI без внешних библиотек: CSS + немного JS
// Всё работает в готовом HTML без скриптов и замирает, если в системе выключено движение
import { useEffect, useRef } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Бегущая строка: четыре копии ленты, видна только первая для экранного диктора
export function Marquee({ items, reverse, duration = 40 }) {
  return (
    <div className={`marquee ${reverse ? 'marquee-reverse' : ''}`} style={{ '--duration': `${duration}s` }}>
      {[0, 1, 2, 3].map(copy => (
        <div className="marquee-track" key={copy} aria-hidden={copy > 0 || undefined}>
          {items.map(({ name, kind }) => <span className={`pill pill-${kind}`} key={name}>{name}</span>)}
        </div>
      ))}
    </div>
  );
}

// Карточка с подсветкой рамки и фона там, где курсор
export function GlowCard({ children, className = '', as: Tag = 'article', style }) {
  function move(e) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
  }
  return (
    <Tag className={`glow-card ${className}`} style={style} onPointerMove={move}>
      <div className="glow-card-inner">{children}</div>
    </Tag>
  );
}

// Кнопка с бегущим бликом по краю
export function ShimmerButton({ children, light, className = '', ...props }) {
  return (
    <button type="button" className={`shimmer-button ${light ? 'shimmer-light' : ''} ${className}`} {...props}>
      <span className="shimmer-spark" aria-hidden="true" />
      <span className="shimmer-label">{children}</span>
    </button>
  );
}

// Текст проявляется по словам по мере прокрутки
export function TextReveal({ text }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) { el.style.setProperty('--p', 1); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);
  const words = text.split(' ');
  return (
    <div className="text-reveal" ref={ref} style={{ '--n': words.length }}>
      <div className="text-reveal-sticky">
        <h2 className="text-reveal-text" aria-label={text}>
          {words.map((w, i) => <span key={i} aria-hidden="true" style={{ '--i': i }}>{w} </span>)}
        </h2>
      </div>
    </div>
  );
}

// Мерцающая сетка точек на холсте; стоит на месте вне экрана и при выключенном движении
export function FlickeringGrid({ color = '156, 195, 230', maxOpacity = 0.18, chance = 0.08, size = 3, gap = 7 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let cols = 0, rows = 0, cells = new Float32Array(0), raf = 0, visible = false, last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr; canvas.height = height * dpr;
      cols = Math.ceil(width / (size + gap)); rows = Math.ceil(height / (size + gap));
      cells = new Float32Array(cols * rows).map(() => Math.random() * maxOpacity);
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        ctx.fillStyle = `rgba(${color}, ${cells[i * rows + j]})`;
        ctx.fillRect(i * (size + gap) * dpr, j * (size + gap) * dpr, size * dpr, size * dpr);
      }
    };
    const tick = t => {
      raf = requestAnimationFrame(tick);
      if (t - last < 60) return;
      last = t;
      for (let k = 0; k < cells.length; k++) if (Math.random() < chance * 0.25) cells[k] = Math.random() * maxOpacity;
      draw();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced()) raf = requestAnimationFrame(tick);
    });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas); io.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [color, maxOpacity, chance, size, gap]);
  return <canvas ref={ref} className="flickering-grid" aria-hidden="true" />;
}

// Расходящиеся круги
export function Ripple({ count = 6, base = 260 }) {
  return (
    <div className="ripple" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ '--i': i, width: base + i * 70, height: base + i * 70, opacity: 0.12 - i * 0.015 }} />
      ))}
    </div>
  );
}
