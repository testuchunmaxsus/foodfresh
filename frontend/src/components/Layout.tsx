import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../store/auth";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/inventory", label: "Inventar" },
  { to: "/storages", label: "Saqlash" },
];

export default function Layout() {
  const logout = useAuth((s) => s.logout);

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-white border-r p-6 flex flex-col">
        <Link to="/" className="text-2xl font-bold text-brand mb-8">
          FreshFood
        </Link>
        <nav className="flex-1 space-y-1">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm ${
                  isActive
                    ? "bg-brand-light text-brand-dark font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-4 text-sm text-gray-500 hover:text-red-600 text-left"
        >
          Chiqish
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
