export function drawMiniMoon(canvas, phase) {
  if (!canvas) return;
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  const radius = size / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const illumination = 0.5 * (1 - Math.cos(phase * Math.PI * 2));

  ctx.clearRect(0, 0, size, size);

  if (illumination > 0.75) {
    const glowFactor = (illumination - 0.75) / 0.25;
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.7);
    glow.addColorStop(0, `rgba(230,220,170,${glowFactor * 0.22})`);
    glow.addColorStop(1, 'rgba(230,220,170,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const dark = '#090b1a';
  const lit = '#d6d1aa';
  const waxing = phase <= 0.5;
  const ellipseScale = Math.cos(phase * Math.PI * 2);

  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = lit;
  ctx.beginPath();
  if (waxing) ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI / 2);
  else ctx.arc(cx, cy, radius, Math.PI / 2, 3 * Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  if (Math.abs(ellipseScale) > 0.015) {
    ctx.fillStyle = ellipseScale > 0 ? dark : lit;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(Math.abs(ellipseScale), 1);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const shading = ctx.createRadialGradient(cx * 0.65, cy * 0.55, 0, cx, cy, radius);
  shading.addColorStop(0, 'rgba(255,255,240,0.08)');
  shading.addColorStop(0.52, 'rgba(0,0,0,0)');
  shading.addColorStop(1, 'rgba(0,0,25,0.45)');
  ctx.fillStyle = shading;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200,180,125,0.25)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}
