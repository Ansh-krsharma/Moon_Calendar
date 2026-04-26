import { useEffect, useRef } from 'react';

export default function StarsBackground() {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let width = 0;
    let height = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.floor((width * height) / 2100);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.35 + 0.15,
        alpha: Math.random() * 0.65 + 0.12,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0009 + 0.00025,
      }));
    };

    const onMouseMove = (event) => {
      mouseRef.current = {
        x: (event.clientX - window.innerWidth / 2) * 0.00002,
        y: (event.clientY - window.innerHeight / 2) * 0.00002,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const { x: mx, y: my } = mouseRef.current;
      for (const star of starsRef.current) {
        star.twinkle += star.speed;
        star.x += mx;
        star.y += my;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;
        const alpha = Math.max(0, star.alpha + Math.sin(star.twinkle) * 0.18);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,252,238,${alpha})`;
        ctx.fill();
      }
      if (!prefersReducedMotion) animationFrame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="stars-canvas" aria-hidden="true" />;
}
