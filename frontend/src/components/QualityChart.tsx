import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { t: string; q: number };

type Props = {
  points: Point[];
  critical?: number;
};

export default function QualityChart({ points, critical = 0.6 }: Props) {
  const data = points.map((p) => ({
    time: new Date(p.t).toLocaleString("uz", { month: "short", day: "numeric", hour: "2-digit" }),
    q: Number((p.q * 100).toFixed(1)),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h3 className="font-semibold mb-1">Sifat dinamikasi Q(t)</h3>
      <p className="text-xs text-gray-500 mb-4">
        Arrenius kinetikasi: Q(t) = Q₀ · exp(−∫k(T)dt)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <ReferenceLine
            y={critical * 100}
            stroke="#dc2626"
            strokeDasharray="4 2"
            label={{ value: "kritik", fill: "#dc2626", fontSize: 11, position: "right" }}
          />
          <Line
            type="monotone"
            dataKey="q"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
