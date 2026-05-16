import { BlockMath, InlineMath } from "react-katex";

export default function MathModel() {
  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Matematik model</h1>
        <p className="text-gray-500 mt-2">
          FreshFood platformasi ozuq-ovqat sifatining vaqt va haroratga bog'liq
          dinamikasini hisoblash uchun birinchi tartibli kinetik model va
          Arrenius tenglamasini birlashtiradi.
        </p>
      </header>

      <Section title="1. Sifat dinamikasi tenglamasi">
        <p>
          Ozuq-ovqat mahsulotining sifat ko'rsatkichi <InlineMath math="Q(t) \in [0, 1]" /> uchun
          birinchi tartibli kinetik tenglama:
        </p>
        <BlockMath math="\frac{dQ}{dt} = -k(T) \cdot Q" />
        <p>
          Bu yerda <InlineMath math="k(T)" /> — haroratga bog'liq eskirish tezligi konstantasi.
          Doimiy haroratda tenglama yopiq yechimga ega:
        </p>
        <BlockMath math="Q(t) = Q_0 \cdot e^{-k(T) \cdot t}" />
        <p>
          <InlineMath math="Q_0 = 1" /> — yangi mahsulot, <InlineMath math="Q = 0" /> — to'liq yaroqsiz.
          Kritik chegara <InlineMath math="Q_{\text{crit}}" /> har bir mahsulot turi uchun
          empirik aniqlanadi (mol go'shti uchun 0.60, sut uchun 0.55, va h.k.).
        </p>
      </Section>

      <Section title="2. Arrenius tenglamasi (harorat ta'siri)">
        <p>
          <InlineMath math="k(T)" /> koeffitsiyenti haroratga eksponensial ravishda bog'liq:
        </p>
        <BlockMath math="k(T) = A \cdot \exp\!\left(-\frac{E_a}{R \cdot T}\right)" />
        <Where>
          <li><InlineMath math="A" /> — preeksponensial faktor (1/soat), mahsulot uchun kalibrlanadi</li>
          <li><InlineMath math="E_a" /> — aktivlanish energiyasi (J/mol)</li>
          <li><InlineMath math="R = 8.314 \; \text{J}/(\text{mol} \cdot \text{K})" /> — universal gaz konstantasi</li>
          <li><InlineMath math="T" /> — absolyut harorat (Kelvin)</li>
        </Where>
        <p>
          <b>Amaliy talqin (Q10 qoidasi):</b> harorat 10°C ga oshganda eskirish
          tezligi taxminan 2–3 baravarga oshadi. Bizning kalibrlash bilan
          mol go'shti uchun: <InlineMath math="k(14°\text{C})/k(4°\text{C}) \approx 3.1" />.
        </p>
      </Section>

      <Section title="3. Harorat fluktuatsiyasi (real holatda)">
        <p>
          Sovutgich harorati doim o'zgarib turadi (eshik ochilishi, kompressor sikl,
          atrof-muhit). Shu sababli integral shaklda hisoblanadi:
        </p>
        <BlockMath math="Q(t) = Q_0 \cdot \exp\!\left(-\int_0^t k(T(s)) \, ds\right)" />
        <p>
          Tizim sensor ma'lumotlarini trapezoidal integratsiya bilan birlashtiradi.
          Backend kodi: <Code>apps/math_engine/freshness.py:quality_integral()</Code>
        </p>
      </Section>

      <Section title="4. FIFO optimizatsiyasi (chiziqli dasturlash)">
        <p>
          Kunlik iste'mol uchun qaysi partiyani avval ishlatish optimal? Optimizatsiya
          masalasi:
        </p>
        <BlockMath math="\max \sum_i Q_i \cdot x_i" />
        <BlockMath math="\text{s.t.} \quad \sum_i x_i \geq D, \quad 0 \leq x_i \leq z_i" />
        <Where>
          <li><InlineMath math="x_i" /> — i-partiyadan ishlatiladigan miqdor</li>
          <li><InlineMath math="z_i" /> — i-partiyadagi mavjud zaxira</li>
          <li><InlineMath math="D" /> — kunlik talab</li>
          <li><InlineMath math="Q_i" /> — i-partiyaning joriy sifati</li>
        </Where>
        <p>
          Hozirgi implementatsiya: past-Q-birinchi greedy yondashuv
          (<InlineMath math="O(n \log n)" />). To'liq LP: <Code>scipy.optimize.linprog</Code>.
        </p>
      </Section>

      <Section title="5. Yo'qotish prognozi (Monte-Carlo)">
        <p>
          Kelgusi <InlineMath math="\Delta t" /> davrdagi yo'qotish ehtimoli noaniqlik
          ostida baholash uchun 5,000–10,000 ta simulyatsiya:
        </p>
        <BlockMath math="T_i \sim \mathcal{N}(\mu_T, \sigma_T^2)" />
        <BlockMath math="Q_{\text{final},i} = Q_{\text{current}} \cdot \exp(-k(T_i) \cdot \Delta t)" />
        <BlockMath math="P(\text{waste}) = \frac{1}{N} \sum_{i=1}^N \mathbb{1}\!\left[Q_{\text{final},i} < Q_{\text{crit}}\right]" />
        <p>
          Natija: P5, P50, P95 sifat oraliqlari va kutilayotgan yo'qotish summasi (so'm).
        </p>
      </Section>

      <Section title="6. Kalibrlangan parametrlar">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <Th>Mahsulot</Th>
                <Th>E_a (kJ/mol)</Th>
                <Th>A (1/soat)</Th>
                <Th>T_opt (°C)</Th>
                <Th>Q_crit</Th>
              </tr>
            </thead>
            <tbody>
              <Row d={["Mol go'shti", "75", "1.2·10¹¹", "0 – 4", "0.60"]} />
              <Row d={["Tovuq", "70", "9.5·10¹⁰", "0 – 4", "0.65"]} />
              <Row d={["Baliq", "65", "8.0·10¹⁰", "−1 – 2", "0.70"]} />
              <Row d={["Sut", "80", "1.5·10¹¹", "2 – 6", "0.55"]} />
              <Row d={["Yashil sabzavotlar", "60", "5.0·10¹⁰", "4 – 10", "0.50"]} />
              <Row d={["Olma", "55", "3.5·10¹⁰", "6 – 12", "0.45"]} />
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500">
          Parametrlar ilmiy adabiyot va pilot ma'lumotlardan olingan; ishlab chiqarish
          muhitida har bir restoran uchun qayta kalibrlash tavsiya etiladi.
        </p>
      </Section>

      <Section title="7. Validatsiya">
        <p>Birliklash testlari (<Code>backend/tests/test_freshness.py</Code>):</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>k(T) haroratga bog'liq monoton ravishda o'sadi</li>
          <li>Q(t) vaqt bo'yicha monoton ravishda kamayadi</li>
          <li>Q10 qoidasi (2 ≤ k(14°C)/k(4°C) ≤ 4)</li>
          <li>Trapezoidal integral ⇔ yopiq formula (xato &lt; 10⁻³)</li>
          <li>Monte-Carlo ehtimol [0, 1] da, P5 ≤ ortacha ≤ P95</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Where({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-md p-3 text-sm">
      <p className="font-medium mb-1">Bu yerda:</p>
      <ul className="list-disc pl-5 space-y-1">{children}</ul>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium text-gray-600 border-b">{children}</th>;
}

function Row({ d }: { d: string[] }) {
  return (
    <tr className="border-b">
      {d.map((c, i) => (
        <td key={i} className="px-3 py-2">
          {c}
        </td>
      ))}
    </tr>
  );
}
