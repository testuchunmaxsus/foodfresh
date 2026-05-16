import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../api/client";

type Storage = {
  id: number;
  name: string;
  type: string;
  target_temp_min: number;
  target_temp_max: number;
  current_temp: number | null;
  simulate_sensor: boolean;
};

export default function Storages() {
  const { data, isLoading } = useQuery({
    queryKey: ["storages-all"],
    queryFn: async () => (await api.get<{ results: Storage[] }>("/storages/")).data.results,
    refetchInterval: 30_000,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Saqlash joylari</h1>
      {isLoading ? (
        <p className="text-gray-500">Yuklanmoqda...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map((s) => {
            const outOfRange =
              s.current_temp !== null &&
              (s.current_temp < s.target_temp_min || s.current_temp > s.target_temp_max);
            return (
              <Link
                key={s.id}
                to={`/storages/${s.id}`}
                className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{s.name}</h3>
                  <span className="text-xs text-gray-500 uppercase">{s.type}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Maqsad: {s.target_temp_min}° dan {s.target_temp_max}° gacha
                  {s.simulate_sensor && <span className="ml-2 text-blue-600">· sim</span>}
                </p>
                <p
                  className={`mt-3 text-2xl font-bold ${
                    outOfRange ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {s.current_temp ?? "—"}°C
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
