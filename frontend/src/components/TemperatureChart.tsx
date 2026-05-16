import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Reading = { recorded_at: string; temperature: number };

type Props = {
  readings: Reading[];
  targetMin: number;
  targetMax: number;
};

export default function TemperatureChart({ readings, targetMin, targetMax }: Props) {
  const data = readings
    .slice()
    .sort((a, b) => +new Date(a.recorded_at) - +new Date(b.recorded_at))
    .map((r) => ({
      time: new Date(r.recorded_at).toLocaleString("uz", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      t: r.temperature,
    }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h3 className="font-semibold mb-1">Harorat tarixi</h3>
      <p className="text-xs text-gray-500 mb-4">
        Yashil zona — maqsadli oraliq ({targetMin}° dan {targetMax}° gacha)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} unit="°C" />
          <Tooltip formatter={(v: number) => `${v}°C`} />
          <ReferenceArea
            y1={targetMin}
            y2={targetMax}
            fill="#86efac"
            fillOpacity={0.2}
          />
          <Line
            type="monotone"
            dataKey="t"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
