import { useQuery } from "@tanstack/react-query";
import { ArrowDownAZ } from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "../api/client";

type Item = {
  batch_id: number;
  product_name: string;
  storage_name: string;
  quantity: number;
  unit: string;
  Q: number;
  Q_critical: number;
  unit_price: number;
  received_at: string;
};

export default function FIFO() {
  const { data, isLoading } = useQuery({
    queryKey: ["fifo"],
    queryFn: async () =>
      (await api.get<{ count: number; items: Item[] }>("/recommendations/fifo/")).data,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-dark grid place-items-center">
          <ArrowDownAZ />
        </div>
        <div>
          <h1 className="text-2xl font-bold">FIFO tavsiyalar</h1>
          <p className="text-sm text-gray-500">
            Sifati past partiyalarni avval ishlatish — yo'qotishni minimallashtiradi
          </p>
        </div>
      </header>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-medium mb-1">Algoritm</p>
        <p>
          Har bir mahsulot turi ichida partiyalar Q (sifat) bo'yicha o'sish tartibida
          tartiblanadi. Eng past Q'li partiya birinchi ishlatiladi (greedy yondashuv,
          chiziqli dasturlash <code className="bg-blue-100 px-1 rounded">scipy.optimize.linprog</code> bilan
          to'liq optimallashtirilgan).
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          Aktiv partiyalar yo'q.
        </div>
      ) : (
        <ol className="space-y-2">
          {data?.items.map((it, idx) => {
            const critical = it.Q <= it.Q_critical;
            return (
              <li
                key={it.batch_id}
                className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
                  critical ? "border-red-300" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg grid place-items-center font-bold ${
                    critical
                      ? "bg-red-100 text-red-700"
                      : idx < 3
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{it.product_name}</p>
                  <p className="text-xs text-gray-500">
                    {it.storage_name} · {new Date(it.received_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {it.quantity} {it.unit}
                  </p>
                  <p
                    className={`text-xs ${
                      critical
                        ? "text-red-600 font-semibold"
                        : it.Q < 0.7
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    Q = {(it.Q * 100).toFixed(0)}%
                    {critical && " · kritik"}
                  </p>
                </div>
                <Link
                  to={`/inventory/${it.batch_id}`}
                  className="text-xs text-brand-dark hover:underline"
                >
                  Ko'rish →
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function Skeleton() {
  return <div className="bg-white rounded-xl border p-4 h-20 animate-pulse" />;
}
