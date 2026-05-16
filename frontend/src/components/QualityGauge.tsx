type Props = {
  value: number;
  critical?: number;
  size?: number;
  label?: string;
};

function colorFor(q: number, critical: number) {
  if (q < critical) return "#dc2626";
  if (q < critical + 0.15) return "#f59e0b";
  if (q < 0.85) return "#84cc16";
  return "#16a34a";
}

export default function QualityGauge({
  value,
  critical = 0.6,
  size = 160,
  label = "Sifat",
}: Props) {
  const q = Math.max(0, Math.min(1, value));
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const filled = arc * q;
  const color = colorFor(q, critical);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.85}`}>
        <g transform={`rotate(135 ${c} ${c})`}>
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
            strokeDasharray={`${arc} ${circ}`}
            strokeLinecap="round"
          />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 600ms ease" }}
          />
        </g>
        <text
          x={c}
          y={c}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-bold"
          style={{ fontSize: size * 0.22, fill: color }}
        >
          {(q * 100).toFixed(0)}%
        </text>
        <text
          x={c}
          y={c + size * 0.18}
          textAnchor="middle"
          className="text-xs"
          style={{ fontSize: size * 0.08, fill: "#6b7280" }}
        >
          {label}
        </text>
      </svg>
      <p className="text-xs text-gray-500">
        Kritik chegara: {(critical * 100).toFixed(0)}%
      </p>
    </div>
  );
}
