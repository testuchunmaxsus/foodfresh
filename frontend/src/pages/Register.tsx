import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../store/auth";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const setTokens = useAuth((s) => s.setTokens);
  const navigate = useNavigate();

  const onChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/auth/register/", form);
      const { data } = await api.post("/auth/login/", {
        email: form.email,
        password: form.password,
      });
      setTokens(data.access, data.refresh);
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : "Xato.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow p-8 w-full max-w-md space-y-3"
      >
        <h1 className="text-2xl font-bold text-brand">Ro'yxatdan o'tish</h1>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Ism" value={form.first_name} onChange={onChange("first_name")} className="border rounded-md px-3 py-2" />
          <input placeholder="Familiya" value={form.last_name} onChange={onChange("last_name")} className="border rounded-md px-3 py-2" />
        </div>
        <input type="email" required placeholder="Email" value={form.email} onChange={onChange("email")} className="w-full border rounded-md px-3 py-2" />
        <input placeholder="Telefon" value={form.phone} onChange={onChange("phone")} className="w-full border rounded-md px-3 py-2" />
        <input type="password" required placeholder="Parol" value={form.password} onChange={onChange("password")} className="w-full border rounded-md px-3 py-2" />
        {error && <p className="text-sm text-red-600 break-all">{error}</p>}
        <button className="w-full bg-brand text-white py-2 rounded-md hover:bg-brand-dark">
          Davom etish
        </button>
        <p className="text-sm text-center text-gray-500">
          Hisobingiz bormi?{" "}
          <Link to="/login" className="text-brand-dark font-medium">
            Kirish
          </Link>
        </p>
      </form>
    </div>
  );
}
