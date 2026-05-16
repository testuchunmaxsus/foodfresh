import { Sparkles, Thermometer, TrendingDown, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-dark via-brand to-emerald-700 text-white p-12">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="w-7 h-7" />
          FreshFood
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Restoran yo'qotishlarini <br /> 30% gacha kamaytiring
          </h1>
          <p className="text-emerald-50 text-lg">
            Arrenius kinetikasi va real-time sensor ma'lumotlari asosida
            har bir mahsulot partiyasining sifatini bashorat qiluvchi platforma.
          </p>
          <ul className="space-y-3">
            <Feature icon={Thermometer} text="Sovutgich harorati live monitoring" />
            <Feature icon={TrendingDown} text="Monte-Carlo yo'qotish prognozi" />
            <Feature icon={Zap} text="Kritik holatlarda avtomatik alert" />
          </ul>
        </div>
        <p className="text-xs text-emerald-100/70">
          Toshkentdagi pilot restoranlarda sinovdan o'tgan
        </p>
      </div>
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-white/20 grid place-items-center">
        <Icon className="w-4 h-4" />
      </span>
      <span>{text}</span>
    </li>
  );
}
