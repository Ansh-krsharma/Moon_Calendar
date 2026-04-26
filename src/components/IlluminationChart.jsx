import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getMonthIllumination } from '../services/moonService.js';

export default function IlluminationChart({ viewYear, viewMonth, moonEngine }) {
  const data = getMonthIllumination(viewYear, viewMonth, { engine: moonEngine });
  const titleId = `illumination-chart-${viewYear}-${viewMonth}`;
  return (
    <section className="chart-card" aria-labelledby={titleId}>
      <div>
        <span className="section-label">Monthly trend</span>
        <h3 id={titleId}>Illumination Curve</h3>
      </div>
      <div className="chart-wrap" role="img" aria-label="Daily moon illumination percentage for the selected month">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -25 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#080b18', border: '1px solid rgba(200,168,75,.22)', borderRadius: 12 }} />
            <Area type="monotone" dataKey="illumination" stroke="currentColor" fill="currentColor" fillOpacity={0.16} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
