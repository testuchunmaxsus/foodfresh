import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Bell, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { api } from "../api/client";

type Alert = {
  id: number;
  type: string;
  severity: string;
  message: string;
  created_at: string;
  read_at: string | null;
  batch: number | null;
};

const SEVERITY = {
  critical: { color: "bg-red-100 text-red-700 border-red-200", label: "Kritik" },
  warning: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Diqqat" },
  info: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Ma'lumot" },
};

export default function Alerts() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", filter],
    queryFn: async () => {
      const url = filter === "unread" ? "/alerts/?unread=1" : "/alerts/";
      return (await api.get<{ results: Alert[] }>(url)).data.results;
    },
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) =>
      (await api.patch(`/alerts/${id}/mark-read/`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("O'qildi deb belgilandi");
    },
  });

  const alerts = data ?? [];
  const unreadCount = alerts.filter((a) => !a.read_at).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 grid place-items-center">
            <Bell />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ogohlantirishlar</h1>
            <p className="text-sm text-gray-500">{unreadCount} ta o'qilmagan</p>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm transition ${
                filter === f ? "bg-white shadow font-medium" : "text-gray-600"
              }`}
            >
              {f === "all" ? "Hammasi" : "O'qilmagan"}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <p className="text-gray-500">Yuklanmoqda...</p>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Ogohlantirishlar yo'q.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => {
            const sev = SEVERITY[a.severity as keyof typeof SEVERITY] || SEVERITY.info;
            const unread = !a.read_at;
            return (
              <li
                key={a.id}
                className={`bg-white border rounded-xl p-4 flex items-start gap-4 ${
                  unread ? "border-l-4 border-l-red-500" : "opacity-70"
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-full text-xs border ${sev.color}`}
                >
                  {sev.label}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{a.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(a.created_at).toLocaleString("uz")} · {a.type}
                  </p>
                </div>
                {unread && (
                  <button
                    onClick={() => markRead.mutate(a.id)}
                    disabled={markRead.isPending}
                    className="flex items-center gap-1 text-xs text-brand-dark hover:bg-brand-light px-3 py-1.5 rounded-md"
                  >
                    <Check className="w-3 h-3" />
                    O'qildi
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
