import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import BatchDetail from "./pages/BatchDetail";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import InventoryAdd from "./pages/InventoryAdd";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StorageDetail from "./pages/StorageDetail";
import Storages from "./pages/Storages";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/add" element={<InventoryAdd />} />
          <Route path="/inventory/:id" element={<BatchDetail />} />
          <Route path="/storages" element={<Storages />} />
          <Route path="/storages/:id" element={<StorageDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
