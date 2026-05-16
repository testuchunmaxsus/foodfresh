import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../api/client";
import KPICard from "../components/KPICard";

type Summary = {
  active_batches: number;
  critical_batches: number;
  total_inventory_value: number;
  quality_distribution: {
    excellent: number;
    good: number;
    warning: number;
    critical: number;
  };
  recent_alerts: {
    id: number;
    type: string;
    severity: string;
    message: string;
    created_at: string;
    read_at: string | null;
  }[];
  generated_at: string;
};

const BUCKETS = [
  { key: "excellent", label: "A'lo (≥85%)", color: "#16a34a" },
  { key: "good",      label: "Yaxshi (70–85%)", color: "#84cc16" },
  { key: "warning",   label: "Diqqat", color: "#f59e0b" },
  { key: "critical",  label: "Kritik", color: "#dc2626" },
] as const;

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get<Summary>("/dashboard/summary/")).data,
    refetchInterval: 30_000,
  });

  if (isLoading || !data) {
    return <div className="text-gray-500">Yuklanmoqda...</div>;
  }

  const chart = BUCKETS.map((b) => ({
    label: b.label,
    count: data.quality_distribution[b.key],
    color: b.color,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Yangilangan: {new Date(data.generated_at).toLocaleTimeString("uz")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard label="Aktiv partiyalar" value={data.active_batches} />
        <KPICard
          label="Kritik partiyalar"
          value={data.critical_batches}
          tone={data.critical_batches > 0 ? "bad" : "good"}
        />
        <KPICard
          label="Inventar qiymati"
          value={`${data.total_inventory_value.toLocaleString()} so'm`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold mb-1">Sifat taqsimoti</h3>
          <p className="text-xs text-gray-500 mb-4">
            Aktiv partiyalar Q(t) bo'yicha guruhlangan
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chart} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chart.map((c, i) => (
                  <Cell key={i} fill={c.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Oxirgi ogohlantirishlar</h3>
            <Link to="/inventory" className="text-xs text-brand-dark">Hammasi</Link>
          </div>
          {data.recent_alerts.length === 0 ? (
            <p className="text-sm text-gray-500">Ogohlantirishlar yo'q.</p>
          ) : (
            <ul className="space-y-3">
              {data.recent_alerts.map((a) => (
                <li key={a.id} className="text-sm border-l-4 pl-3 py-1"
                  style={{
                    borderColor:
                      a.severity === "critical" ? "#dc2626"
                        : a.severity === "warning" ? "#f59e0b" : "#94a3b8",
                  }}
                >
                  <p className="font-medium">{a.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(a.created_at).toLocaleString("uz")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
