import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../store/auth";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const setTokens = useAuth((s) => s.setTokens);
  const navigate = useNavigate();

  const onChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register/", form);
      const { data } = await api.post("/auth/login/", {
        email: form.email,
        password: form.password,
      });
      setTokens(data.access, data.refresh);
      toast.success("Hisob yaratildi!");
      navigate("/");
    } catch (err: any) {
      const detail = err.response?.data;
      const msg = detail ? Object.values(detail).flat()[0] || "Xato" : "Xato";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Ro'yxatdan o'tish</h2>
          <p className="text-sm text-gray-500 mt-1">Restoraningizni ulang va boshlang</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Ism"
            value={form.first_name}
            onChange={onChange("first_name")}
            className="border rounded-md px-3 py-2"
          />
          <input
            placeholder="Familiya"
            value={form.last_name}
            onChange={onChange("last_name")}
            className="border rounded-md px-3 py-2"
          />
        </div>
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={onChange("email")}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          placeholder="Telefon (+998 ...)"
          value={form.phone}
          onChange={onChange("phone")}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Parol (kamida 8 belgi)"
          value={form.password}
          onChange={onChange("password")}
          className="w-full border rounded-md px-3 py-2"
        />
        <button
          disabled={loading}
          className="w-full bg-brand text-white py-2.5 rounded-md hover:bg-brand-dark transition disabled:opacity-60 font-medium"
        >
          {loading ? "Yaratilmoqda..." : "Davom etish"}
        </button>
        <p className="text-sm text-center text-gray-500">
          Hisobingiz bormi?{" "}
          <Link to="/login" className="text-brand-dark font-medium hover:underline">
            Kirish
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
