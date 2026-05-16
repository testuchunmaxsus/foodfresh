import { useQuery } from "@tanstack/react-query";

import { api } from "../api/client";
import KPICard from "../components/KPICard";

type Summary = {
  active_batches: number;
  critical_batches: number;
  total_inventory_value: number;
  generated_at: string;
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await api.get<Summary>("/dashboard/summary/")).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {isLoading ? (
        <div className="text-gray-500">Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard label="Aktiv partiyalar" value={data?.active_batches ?? 0} />
          <KPICard
            label="Kritik partiyalar"
            value={data?.critical_batches ?? 0}
            tone={data && data.critical_batches > 0 ? "bad" : "good"}
          />
          <KPICard
            label="Inventar qiymati"
            value={`${(data?.total_inventory_value ?? 0).toLocaleString()} so'm`}
          />
        </div>
      )}
    </div>
  );
}
