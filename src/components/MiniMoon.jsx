import { useEffect, useRef } from 'react';
import { drawMiniMoon } from '../utils/drawMiniMoon.js';

export default function MiniMoon({ phase, size = 64 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawMiniMoon(canvasRef.current, phase);
  }, [phase]);

  return <canvas ref={canvasRef} width={size} height={size} className="mini-moon" aria-hidden="true" />;
}
