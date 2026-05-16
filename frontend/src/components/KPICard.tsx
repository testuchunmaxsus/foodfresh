type Props = {
  label: string;
  value: string | number;
  tone?: "neutral" | "good" | "warn" | "bad";
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "text-gray-900",
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-red-600",
};

export default function KPICard({ label, value, tone = "neutral" }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
