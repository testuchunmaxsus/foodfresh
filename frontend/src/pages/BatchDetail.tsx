import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../api/client";
import QualityChart from "../components/QualityChart";
import QualityGauge from "../components/QualityGauge";

type Batch = {
  id: number;
  product_name: string;
  storage_name: string;
  quantity_initial: number;
  quantity_current: number;
  unit_price: string;
  unit: string;
  Q_current: number;
  received_at: string;
  status: string;
  last_calculated_at: string | null;
  product_template: number;
};

type Template = {
  id: number;
  Q_critical: number;
  E_a: number;
  A_coefficient: number;
  T_optimal_min: number;
  T_optimal_max: number;
  shelf_life_days_at_4C: number;
};

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [qty, setQty] = useState("");

  const batch = useQuery({
    queryKey: ["batch", id],
    queryFn: async () => (await api.get<Batch>(`/batches/${id}/`)).data,
    refetchInterval: 60_000,
  });

  const tpl = useQuery({
    queryKey: ["template", batch.data?.product_template],
    queryFn: async () =>
      (await api.get<Template>(`/product-templates/${batch.data!.product_template}/`)).data,
    enabled: !!batch.data?.product_template,
  });

  const history = useQuery({
    queryKey: ["batch-history", id],
    queryFn: async () =>
      (await api.get<Array<{ t: string; q: number }>>(`/batches/${id}/quality-history/`)).data,
  });

  const consume = useMutation({
    mutationFn: async (n: number) =>
      (await api.post(`/batches/${id}/consume/`, { quantity: n })).data,
    onSuccess: (_, n) => {
      qc.invalidateQueries({ queryKey: ["batch", id] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      setQty("");
      toast.success(`${n} miqdor ishlatildi`);
    },
    onError: () => toast.error("Yetarli miqdor yo'q"),
  });

  const waste = useMutation({
    mutationFn: async () =>
      (await api.post(`/batches/${id}/waste/`, { note: "Q chegaradan past" })).data,
    onSuccess: () => {
      toast.success("Yo'qotish sifatida belgilandi");
      navigate("/inventory");
    },
  });

  if (batch.isLoading) return <p className="text-gray-500">Yuklanmoqda...</p>;
  if (!batch.data) return <p className="text-gray-500">Topilmadi.</p>;
  const b = batch.data;
  const critical = tpl.data?.Q_critical ?? 0.6;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/inventory" className="text-sm text-gray-500 hover:text-brand-dark">
            ← Inventarga qaytish
          </Link>
          <h1 className="text-2xl font-bold mt-1">{b.product_name}</h1>
          <p className="text-sm text-gray-500">
            {b.storage_name} · qabul: {new Date(b.received_at).toLocaleString("uz")}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            b.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : b.status === "wasted"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {b.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center">
          <QualityGauge value={b.Q_current} critical={critical} />
          {b.last_calculated_at && (
            <p className="text-xs text-gray-500 mt-2">
              Yangilangan: {new Date(b.last_calculated_at).toLocaleString("uz")}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
          <h3 className="font-semibold">Partiya</h3>
          <Row k="Miqdor" v={`${b.quantity_current} / ${b.quantity_initial} ${b.unit}`} />
          <Row k="Birlik narxi" v={`${Number(b.unit_price).toLocaleString()} so'm`} />
          <Row
            k="Qiymat"
            v={`${(b.quantity_current * Number(b.unit_price)).toLocaleString()} so'm`}
          />
          {tpl.data && (
            <>
              <Row
                k="Optimal harorat"
                v={`${tpl.data.T_optimal_min}° dan ${tpl.data.T_optimal_max}° gacha`}
              />
              <Row k="Saqlash muddati (4°C)" v={`${tpl.data.shelf_life_days_at_4C} kun`} />
              <Row k="E_a" v={`${tpl.data.E_a} kJ/mol`} />
              <Row k="A koeffitsiyent" v={tpl.data.A_coefficient.toExponential(2)} />
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
          <h3 className="font-semibold">Amallar</h3>
          {b.status === "active" && (
            <>
              <input
                type="number"
                step="0.1"
                placeholder={`Miqdor (${b.unit})`}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
              <button
                onClick={() => consume.mutate(Number(qty))}
                disabled={!qty || consume.isPending}
                className="w-full bg-brand text-white py-2 rounded-md hover:bg-brand-dark disabled:opacity-50"
              >
                Ishlatish (consume)
              </button>
              <button
                onClick={() => waste.mutate()}
                disabled={waste.isPending}
                className="w-full border border-red-300 text-red-600 py-2 rounded-md hover:bg-red-50"
              >
                Yo'qotish (waste)
              </button>
            </>
          )}
        </div>
      </div>

      {history.data && history.data.length > 1 && (
        <QualityChart points={history.data} critical={critical} />
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
