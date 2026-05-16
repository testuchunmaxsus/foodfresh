import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../api/client";

type ForecastItem = {
  batch_id: number;
  product_name: string;
  Q_current: number;
  waste_probability: number;
  mean_q: number;
  p05_q: number;
  p95_q: number;
  value_at_risk: number;
  expected_loss: number;
};

type ForecastResp = {
  horizon_days: number;
  runs_per_batch: number;
  temperature_sigma: number;
  expected_loss_uzs: number;
  items: ForecastItem[];
};

export default function Forecast() {
  const [hours, setHours] = useState(168);
  const [sigma, setSigma] = useState(1.5);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["forecast", hours, sigma],
    queryFn: async () =>
      (await api.get<ForecastResp>(
        `/forecast/weekly/?hours=${hours}&sigma=${sigma}&runs=5000`
      )).data,
  });

  const chartData =
    data?.items.slice(0, 10).map((it) => ({
      name: it.product_name.length > 15 ? it.product_name.slice(0, 14) + "…" : it.product_name,
      P_waste: Math.round(it.waste_probability * 100),
      loss: it.expected_loss,
    })) ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 grid place-items-center">
          <Activity />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Yo'qotish prognozi</h1>
          <p className="text-sm text-gray-500">
            Monte-Carlo simulyatsiya · {data?.runs_per_batch.toLocaleString()} ta sinov har partiya uchun
          </p>
        </div>
      </header>

      <div className="bg-white border rounded-xl p-5 grid md:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-sm text-gray-600">Vaqt oralig'i (soat)</span>
          <input
            type="number"
            min={24}
            max={720}
            step={24}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">= {(hours / 24).toFixed(1)} kun</p>
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Harorat fluktuatsiyasi σ (°C)</span>
          <input
            type="number"
            min={0.1}
            max={5}
            step={0.1}
            value={sigma}
            onChange={(e) => setSigma(Number(e.target.value))}
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full bg-brand text-white py-2 rounded-md hover:bg-brand-dark disabled:opacity-50"
          >
            {isFetching ? "Hisoblanmoqda..." : "Qayta hisoblash"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Kpi
          label="Prognoz oralig'i"
          value={`${data?.horizon_days ?? "—"} kun`}
        />
        <Kpi
          label="Kutilayotgan yo'qotish"
          value={`${(data?.expected_loss_uzs ?? 0).toLocaleString()} so'm`}
          tone="bad"
        />
        <Kpi label="Sinovlar (jami)" value={`${((data?.runs_per_batch ?? 0) * (data?.items.length ?? 0)).toLocaleString()}`} />
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-1">Top-10 xavfli partiyalar</h3>
          <p className="text-xs text-gray-500 mb-4">Yo'qotish ehtimoli (%) bo'yicha</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 16, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="P_waste" radius={[6, 6, 0, 0]}>
                {chartData.map((c, i) => (
                  <Cell
                    key={i}
                    fill={c.P_waste > 70 ? "#dc2626" : c.P_waste > 30 ? "#f59e0b" : "#16a34a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Yuklanmoqda...</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Mahsulot</th>
                <th className="px-4 py-3">Q hozir</th>
                <th className="px-4 py-3">P(yo'qotish)</th>
                <th className="px-4 py-3">Q prognoz (P5 – P95)</th>
                <th className="px-4 py-3 text-right">Kutilgan zarar</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((it) => (
                <tr key={it.batch_id} className="border-t">
                  <td className="px-4 py-3 font-medium">{it.product_name}</td>
                  <td className="px-4 py-3">{(it.Q_current * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        it.waste_probability > 0.5
                          ? "text-red-600 font-semibold"
                          : it.waste_probability > 0.2
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }
                    >
                      {(it.waste_probability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {(it.p05_q * 100).toFixed(0)}% – {(it.mean_q * 100).toFixed(0)}% – {(it.p95_q * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    {it.expected_loss.toLocaleString()} so'm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "bad" }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone === "bad" ? "text-red-600" : ""}`}>{value}</p>
    </div>
  );
}
