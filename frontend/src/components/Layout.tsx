import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  Box,
  Calculator,
  Home,
  LineChart,
  LogOut,
  Refrigerator,
  Sparkles,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../store/auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/inventory", label: "Inventar", icon: Box },
  { to: "/storages", label: "Saqlash", icon: Refrigerator },
  { to: "/fifo", label: "FIFO tavsiyalar", icon: BarChart3 },
  { to: "/forecast", label: "Prognoz", icon: LineChart },
  { to: "/alerts", label: "Ogohlantirishlar", icon: AlertTriangle },
  { to: "/math-model", label: "Matematik model", icon: Calculator },
];

type Me = { id: number; email: string; first_name: string; last_name: string; role: string };

export default function Layout() {
  const logout = useAuth((s) => s.logout);
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<Me>("/auth/me/")).data,
  });

  const initial =
    me.data?.first_name?.[0]?.toUpperCase() || me.data?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <Link to="/" className="px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand" />
            <span className="text-xl font-bold text-brand">FreshFood</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Saqlash kalkulyatori</p>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  isActive
                    ? "bg-brand-light text-brand-dark font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md">
            <div className="w-9 h-9 rounded-full bg-brand text-white grid place-items-center font-semibold">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {me.data?.first_name || me.data?.email?.split("@")[0] || "—"}
              </p>
              <p className="text-xs text-gray-500 truncate">{me.data?.role}</p>
            </div>
            <button
              onClick={logout}
              title="Chiqish"
              className="text-gray-400 hover:text-red-600 p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
