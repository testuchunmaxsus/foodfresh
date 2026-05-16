import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";
import TemperatureChart from "../components/TemperatureChart";

type Storage = {
  id: number;
  name: string;
  type: string;
  target_temp_min: number;
  target_temp_max: number;
  current_temp: number | null;
  simulate_sensor: boolean;
  sensor_id: string;
};

type Reading = {
  id: number;
  temperature: number;
  recorded_at: string;
  source: string;
};

export default function StorageDetail() {
  const { id } = useParams<{ id: string }>();

  const storage = useQuery({
    queryKey: ["storage", id],
    queryFn: async () => (await api.get<Storage>(`/storages/${id}/`)).data,
    refetchInterval: 30_000,
  });

  const readings = useQuery({
    queryKey: ["readings", id],
    queryFn: async () =>
      (await api.get<Reading[]>(`/temperature-readings/?storage=${id}`)).data,
    refetchInterval: 15_000,
    enabled: !!id,
  });

  if (storage.isLoading) return <p className="text-gray-500">Yuklanmoqda...</p>;
  if (!storage.data) return <p className="text-gray-500">Topilmadi.</p>;

  const s = storage.data;
  const outOfRange =
    s.current_temp !== null &&
    (s.current_temp < s.target_temp_min || s.current_temp > s.target_temp_max);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/storages" className="text-sm text-gray-500 hover:text-brand-dark">
          ← Saqlash joylariga qaytish
        </Link>
        <h1 className="text-2xl font-bold mt-1">{s.name}</h1>
        <p className="text-sm text-gray-500 capitalize">
          {s.type} · maqsad: {s.target_temp_min}° dan {s.target_temp_max}° gacha
          {s.simulate_sensor && <span className="ml-2 text-blue-600">· simulyator yoqilgan</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Joriy harorat</p>
          <p
            className={`mt-2 text-4xl font-bold ${
              outOfRange ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {s.current_temp !== null ? `${s.current_temp}°C` : "—"}
          </p>
          {outOfRange && (
            <p className="text-xs text-red-600 mt-2">⚠ Maqsadli oraliqdan tashqarida</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">O'lchovlar soni</p>
          <p className="mt-2 text-4xl font-bold">{readings.data?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Sensor ID</p>
          <p className="mt-2 text-lg font-mono">{s.sensor_id || "—"}</p>
        </div>
      </div>

      {readings.data && readings.data.length > 1 && (
        <TemperatureChart
          readings={readings.data}
          targetMin={s.target_temp_min}
          targetMax={s.target_temp_max}
        />
      )}
    </div>
  );
}
