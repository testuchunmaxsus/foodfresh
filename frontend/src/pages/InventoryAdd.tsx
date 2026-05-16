import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";

type Option = { id: number; name: string };

export default function InventoryAdd() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    restaurant: "",
    product_template: "",
    storage: "",
    quantity_initial: "",
    unit_price: "0",
    received_at: new Date().toISOString().slice(0, 16),
  });

  const restaurants = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => (await api.get<{ results: Option[] }>("/restaurants/")).data.results,
  });

  const storages = useQuery({
    queryKey: ["storages", form.restaurant],
    queryFn: async () =>
      (await api.get<{ results: Option[] }>(`/storages/?restaurant=${form.restaurant}`)).data.results,
    enabled: !!form.restaurant,
  });

  const templates = useQuery({
    queryKey: ["product-templates"],
    queryFn: async () =>
      (await api.get<{ results: Option[] }>("/product-templates/")).data.results,
  });

  const create = useMutation({
    mutationFn: async (payload: any) => (await api.post("/batches/", payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      navigate("/inventory");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      restaurant: Number(form.restaurant),
      product_template: Number(form.product_template),
      storage: Number(form.storage),
      quantity_initial: Number(form.quantity_initial),
      quantity_current: Number(form.quantity_initial),
      unit_price: form.unit_price,
      received_at: new Date(form.received_at).toISOString(),
    });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Yangi partiya qo'shish</h1>
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <Field label="Restoran">
          <select required value={form.restaurant} onChange={set("restaurant")} className="w-full border rounded-md px-3 py-2">
            <option value="">— tanlang —</option>
            {restaurants.data?.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Saqlash joyi">
          <select required value={form.storage} onChange={set("storage")} className="w-full border rounded-md px-3 py-2">
            <option value="">— tanlang —</option>
            {storages.data?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Mahsulot">
          <select required value={form.product_template} onChange={set("product_template")} className="w-full border rounded-md px-3 py-2">
            <option value="">— tanlang —</option>
            {templates.data?.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Miqdor">
            <input type="number" step="0.01" required value={form.quantity_initial} onChange={set("quantity_initial")} className="w-full border rounded-md px-3 py-2" />
          </Field>
          <Field label="Birlik narxi (so'm)">
            <input type="number" step="0.01" value={form.unit_price} onChange={set("unit_price")} className="w-full border rounded-md px-3 py-2" />
          </Field>
        </div>
        <Field label="Qabul vaqti">
          <input type="datetime-local" required value={form.received_at} onChange={set("received_at")} className="w-full border rounded-md px-3 py-2" />
        </Field>
        {create.isError && (
          <p className="text-sm text-red-600">Saqlashda xato yuz berdi.</p>
        )}
        <button disabled={create.isPending} className="w-full bg-brand text-white py-2 rounded-md hover:bg-brand-dark disabled:opacity-50">
          Saqlash
        </button>
      </form>
    </div>
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
