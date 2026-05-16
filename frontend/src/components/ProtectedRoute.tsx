import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../store/auth";

export default function ProtectedRoute() {
  const access = useAuth((s) => s.access);
  if (!access) return <Navigate to="/login" replace />;
  return <Outlet />;
}
