import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../store/auth";

export default function Login() {
  const [email, setEmail] = useState("demo@freshfood.uz");
  const [password, setPassword] = useState("demo12345");
  const [loading, setLoading] = useState(false);
  const setTokens = useAuth((s) => s.setTokens);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login/", { email, password });
      setTokens(data.access, data.refresh);
      toast.success("Tizimga muvaffaqiyatli kirdingiz");
      navigate("/");
    } catch {
      toast.error("Email yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold">Xush kelibsiz</h2>
          <p className="text-sm text-gray-500 mt-1">
            Hisobingizga kiring va yo'qotishlarni kuzating
          </p>
        </div>

        <div className="space-y-3">
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </Field>
          <Field label="Parol">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </Field>
        </div>

        <button
          disabled={loading}
          className="w-full bg-brand text-white py-2.5 rounded-md hover:bg-brand-dark transition disabled:opacity-60 font-medium"
        >
          {loading ? "Kirilmoqda..." : "Kirish"}
        </button>

        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm">
          <p className="font-semibold text-emerald-900">Demo hisob (avtomatik to'ldirilgan):</p>
          <p className="text-emerald-800 text-xs mt-1">demo@freshfood.uz / demo12345</p>
        </div>

        <p className="text-sm text-center text-gray-500">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-brand-dark font-medium hover:underline">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
