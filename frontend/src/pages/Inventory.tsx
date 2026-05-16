import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../api/client";

type Batch = {
  id: number;
  product_name: string;
  storage_name: string;
  quantity_current: number;
  unit: string;
  Q_current: number;
  status: string;
  received_at: string;
};

export default function Inventory() {
  const { data, isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () =>
      (await api.get<{ results: Batch[] }>("/batches/?status=active&ordering=Q_current")).data,
    refetchInterval: 60_000,
  });

  const batches = data?.results ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventar</h1>
        <Link
          to="/inventory/add"
          className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark"
        >
          + Yangi partiya
        </Link>
      </div>
      {isLoading ? (
        <p className="text-gray-500">Yuklanmoqda...</p>
      ) : batches.length === 0 ? (
        <p className="text-gray-500">Aktiv partiyalar yo'q.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Mahsulot</th>
                <th className="px-4 py-3">Saqlash</th>
                <th className="px-4 py-3">Miqdor</th>
                <th className="px-4 py-3">Sifat (Q)</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.product_name}</td>
                  <td className="px-4 py-3">{b.storage_name}</td>
                  <td className="px-4 py-3">
                    {b.quantity_current} {b.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        b.Q_current < 0.5
                          ? "text-red-600 font-semibold"
                          : b.Q_current < 0.7
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }
                    >
                      {(b.Q_current * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(b.received_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/inventory/${b.id}`}
                      className="text-brand-dark hover:underline text-xs"
                    >
                      Tafsilot →
                    </Link>
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
