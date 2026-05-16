import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../store/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setTokens = useAuth((s) => s.setTokens);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.post("/auth/login/", { email, password });
      setTokens(data.access, data.refresh);
      navigate("/");
    } catch {
      setError("Email yoki parol noto'g'ri.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-brand">FreshFood</h1>
        <p className="text-sm text-gray-500">Tizimga kirish</p>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-brand text-white py-2 rounded-md hover:bg-brand-dark">
          Kirish
        </button>
        <p className="text-sm text-center text-gray-500">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-brand-dark font-medium">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </form>
    </div>
  );
}
