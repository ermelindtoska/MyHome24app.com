// src/pages/SearchPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Helmet } from "react-helmet";

const COLLECTION = "listings";

export default function SearchPage() {
  const [all, setAll] = useState([]);        // të dhënat e marra nga DB
  const [hits, setHits] = useState([]);      // filtruar në UI
  const [loading, setLoading] = useState(false);

  // filtra
  const [purpose, setPurpose] = useState("rent");  // rent | sale | any
  const [type, setType]       = useState("any");   // apartment | house | any
  const [beds, setBeds]       = useState(0);       // 0 = any
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [city, setCity]       = useState("");

  // 1) Ngarko të dhënat një herë (marrim vetëm aktive, të renditura nga createdAt ose price)
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // mbajmë thjeshtë: marrim deri në 200 aktive
        const baseQ = query(
          collection(db, COLLECTION),
          where("status", "==", "active"),
          orderBy("createdAt", "desc"),
          limit(200)
        );
        const snap = await getDocs(baseQ);
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAll(arr);
      } catch (e) {
        console.error("[SearchPage] load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 2) Filtrim në UI (për të shmangur kufizimet e Firestore me shumë desigualsi)
  useEffect(() => {
    const f = all.filter(it => {
      if (purpose !== "any" && it.purpose !== purpose) return false;
      if (type !== "any" && it.type !== type) return false;
      if (beds > 0 && (Number(it.beds || 0) < beds)) return false;
      const p = Number(it.price || 0);
      if (minPrice && p < Number(minPrice)) return false;
      if (maxPrice && p > Number(maxPrice)) return false;
      if (city && String(it?.address?.city || "").toLowerCase() !== city.toLowerCase()) return false;
      return true;
    });
    setHits(f);
  }, [all, purpose, type, beds, minPrice, maxPrice, city]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Helmet><title>Search – MyHome24App</title></Helmet>

      <h1 className="text-xl font-semibold mb-4">Find a home</h1>

      {/* Filtrat */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-5">
        <select value={purpose} onChange={e=>setPurpose(e.target.value)} className="border rounded px-2 py-2">
          <option value="rent">Rent</option>
          <option value="sale">Buy</option>
          <option value="any">Any</option>
        </select>

        <select value={type} onChange={e=>setType(e.target.value)} className="border rounded px-2 py-2">
          <option value="any">Any type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="condo">Condo</option>
        </select>

        <select value={beds} onChange={e=>setBeds(Number(e.target.value))} className="border rounded px-2 py-2">
          <option value="0">Beds (any)</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>

        <input
          className="border rounded px-2 py-2"
          placeholder="City (optional)"
          value={city}
          onChange={e=>setCity(e.target.value)}
        />

        <input
          className="border rounded px-2 py-2"
          placeholder="Min €"
          value={minPrice}
          onChange={e=>setMinPrice(e.target.value)}
          inputMode="numeric"
        />
        <input
          className="border rounded px-2 py-2"
          placeholder="Max €"
          value={maxPrice}
          onChange={e=>setMaxPrice(e.target.value)}
          inputMode="numeric"
        />

        <button
          type="button"
          onClick={() => { /* vend për “Reset” nëse do */ setPurpose("rent"); setType("any"); setBeds(0); setMinPrice(""); setMaxPrice(""); setCity(""); }}
          className="border rounded px-2 py-2"
        >
          Reset
        </button>
      </div>

      {/* Lista */}
      {loading && <div className="opacity-70">Loading…</div>}
      {!loading && hits.length === 0 && <div>No results</div>}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hits.map(h => (
          <li key={h.id} className="border rounded p-3 bg-white/60 dark:bg-gray-800/60">
            <div className="font-semibold">{h.title || "Untitled"}</div>
            <div className="text-sm opacity-70">
              {h?.address?.city || "—"} · {h.type} · {h.beds ?? 0} bd / {h.baths ?? 0} ba · {h.sizeSqm ?? "—"} m²
            </div>
            <div className="font-bold mt-1">€ {Number(h.price || 0).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
