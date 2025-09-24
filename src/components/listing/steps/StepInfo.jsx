// src/components/listing/steps/StepInfo.jsx
import React, { useMemo, useState, useEffect } from "react";

export default function StepInfo({ initial, onChange, onNext }) {
  // 1) form state
  const [form, setForm] = useState(() => ({
    purpose: "buy",
    type: "house",
    title: "",
    description: "",
    price: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    livingArea: "",
    yearBuilt: "",
    ...(initial || {})
  }));

  // 2) mos e rifresko form-ën pa nevojë
  useEffect(() => {
    if (initial) setForm((s) => ({ ...s, ...initial }));
    // vetëm kur ndryshon initial reference (p.sh. kur kthehesh prapa)
  }, [initial]);

  // 3) helper i thjeshtë për controlled inputs
  const bind = (name) => ({
    name,
    value: form[name] ?? "",
    onChange: (e) => {
      const v = e.target.value; // mos e kthe në number këtu!
      setForm((s) => {
        const next = { ...s, [name]: v };
        onChange?.(next);        // njofto prindin pa i resetuar fëmijët
        return next;
      });
    },
  });

  // 4) validim për "Weiter"
  const required = [
    "purpose","type","title","description",
    "price","rooms","bedrooms","bathrooms",
    "livingArea","yearBuilt"
  ];

  const canNext = useMemo(
    () => required.every((k) => String(form[k] ?? "").trim() !== ""),
    [form]
  );

  const handleNext = () => {
    // konverto numrat këtu, jo në onChange
    const payload = {
      ...form,
      price: Number(form.price),
      rooms: Number(form.rooms),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      livingArea: Number(form.livingArea),
      yearBuilt: Number(form.yearBuilt),
    };
    onChange?.(payload);
    onNext?.();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">Zweck</label>
          <select {...bind("purpose")} className="w-full p-3 rounded-xl border">
            <option value="buy">Kaufen</option>
            <option value="rent">Mieten</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Typ</label>
          <select {...bind("type")} className="w-full p-3 rounded-xl border">
            <option value="house">Haus</option>
            <option value="apartment">Wohnung</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Titel</label>
          <input type="text" {...bind("title")} className="w-full p-3 rounded-xl border" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Beschreibung</label>
          <textarea rows={5} {...bind("description")} className="w-full p-3 rounded-xl border" />
        </div>

        {/* LERI input type="text" edhe për numrat që të mos prishet input-i gjatë shkrimit */}
        <div>
          <label className="block text-sm mb-1">Preis (€)</label>
          <input type="text" inputMode="numeric" {...bind("price")} className="w-full p-3 rounded-xl border" />
        </div>

        <div>
          <label className="block text-sm mb-1">Wohnfläche (m²)</label>
          <input type="text" inputMode="numeric" {...bind("livingArea")} className="w-full p-3 rounded-xl border" />
        </div>

        <div>
          <label className="block text-sm mb-1">Zimmer</label>
          <input type="text" inputMode="numeric" {...bind("rooms")} className="w-full p-3 rounded-xl border" />
        </div>

        <div>
          <label className="block text-sm mb-1">Schlafzimmer</label>
          <input type="text" inputMode="numeric" {...bind("bedrooms")} className="w-full p-3 rounded-xl border" />
        </div>

        <div>
          <label className="block text-sm mb-1">Badezimmer</label>
          <input type="text" inputMode="numeric" {...bind("bathrooms")} className="w-full p-3 rounded-xl border" />
        </div>

        <div>
          <label className="block text-sm mb-1">Baujahr</label>
          <input type="text" inputMode="numeric" {...bind("yearBuilt")} className="w-full p-3 rounded-xl border" />
        </div>
      </div>

      <div className="flex justify-between">
        {/* button “Zurück” nëse keni */}
        <div />

        <button
          type="button"
          disabled={!canNext}
          onClick={handleNext}
          className={`px-4 py-2 rounded-xl ${canNext ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
