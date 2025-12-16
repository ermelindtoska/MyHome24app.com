// src/pages/MortgageRequestPage.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import SiteMeta from "../components/SEO/SiteMeta";
import { useAuth } from "../context/AuthContext";

// 🔁 Passe den Import an dein Projekt an (wo auch immer db exportiert wird)
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import {
  FaLockOpen,
  FaShieldAlt,
  FaRegCheckCircle,
  FaRegClock,
  FaArrowLeft,
} from "react-icons/fa";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const MortgageRequestPage = () => {
  const { t, i18n } = useTranslation("mortgageRequest");
  const navigate = useNavigate();
  const query = useQuery();
  const { currentUser } = useAuth();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/mortgage/request`;

  const presetPurchasePrice = query.get("purchasePrice");
  const presetEquity = query.get("equity");
  const presetRate = query.get("rate");
  const presetYears = query.get("years");

  const [form, setForm] = useState({
    fullName: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    consentContact: true,

    purpose: "buy", // buy | refinance
    purchasePrice: presetPurchasePrice ? Number(presetPurchasePrice) : 450000,
    equity: presetEquity ? Number(presetEquity) : 90000,
    interestRate: presetRate ? Number(presetRate) : 3.2,
    years: presetYears ? Number(presetYears) : 30,

    propertyCity: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [doneId, setDoneId] = useState("");
  const [error, setError] = useState("");

  const loanAmount = Math.max(0, Number(form.purchasePrice) - Number(form.equity));

  const monthlyEstimate = useMemo(() => {
    const P = loanAmount;
    const annual = Number(form.interestRate) / 100;
    const r = annual / 12;
    const n = Number(form.years) * 12;
    if (!P || !r || !n) return 0;
    const m = (P * r) / (1 - Math.pow(1 + r, -n));
    if (!Number.isFinite(m)) return 0;
    return m;
  }, [loanAmount, form.interestRate, form.years]);

  const handleChange = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

  const sanitizeNumber = (v, min = 0, max = 999999999) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Minimal validation (Zillow-ish: niedrigschwellig)
    if (!String(form.email || "").includes("@")) {
      setError(t("form.errors.email"));
      return;
    }
    if (!form.consentContact) {
      setError(t("form.errors.consent"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        // Zillow-style: auch ohne Login möglich
        userId: currentUser?.uid ?? null,
        userEmail: currentUser?.email ?? null,

        fullName: String(form.fullName || "").trim() || null,
        email: String(form.email || "").trim(),
        phone: String(form.phone || "").trim() || null,

        purpose: form.purpose,
        purchasePrice: sanitizeNumber(form.purchasePrice, 0),
        equity: sanitizeNumber(form.equity, 0),
        loanAmount: sanitizeNumber(loanAmount, 0),
        interestRate: sanitizeNumber(form.interestRate, 0, 30),
        years: sanitizeNumber(form.years, 1, 40),

        propertyCity: String(form.propertyCity || "").trim() || null,
        notes: String(form.notes || "").trim() || null,

        consentContact: !!form.consentContact,
        status: "new", // new | assigned | contacted | closed (future-proof)
        createdAt: serverTimestamp(),
        source: "mortgage_request_page",
        locale: lang,
      };

      const ref = await addDoc(collection(db, "financeRequests"), payload);
      setDoneId(ref.id);
    } catch (err) {
      console.error(err);
      setError(t("form.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-mortgage-request.jpg`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/40 px-4 py-2 text-xs font-semibold hover:bg-slate-900 transition"
          >
            <FaArrowLeft />
            {t("back")}
          </button>

          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-200">
            <FaLockOpen />
            {t("badgeNoLogin")}
          </span>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] items-start">
          {/* Left: Form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 md:p-7 shadow-2xl">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-slate-200 max-w-2xl">
              {t("subtitle")}
            </p>

            {/* Trust row */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <TrustCard icon={FaShieldAlt} title={t("trust.0.title")} text={t("trust.0.text")} />
              <TrustCard icon={FaRegClock} title={t("trust.1.title")} text={t("trust.1.text")} />
              <TrustCard icon={FaRegCheckCircle} title={t("trust.2.title")} text={t("trust.2.text")} />
            </div>

            {doneId ? (
              <div className="mt-7 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5">
                <h2 className="text-lg font-semibold text-emerald-200">
                  {t("success.title")}
                </h2>
                <p className="mt-2 text-sm text-slate-100">
                  {t("success.text")}
                </p>
                <p className="mt-3 text-xs text-slate-300">
                  {t("success.ref")} <span className="font-mono">{doneId}</span>
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/mortgage/calculator")}
                    className="rounded-full bg-slate-50 text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-white transition"
                  >
                    {t("success.ctaCalculator")}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/mortgage/partners")}
                    className="rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold hover:bg-slate-900 transition"
                  >
                    {t("success.ctaPartners")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-7 space-y-5">
                {error ? (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("form.fullName.label")} hint={t("form.fullName.hint")}>
                    <input
                      value={form.fullName}
                      onChange={handleChange("fullName")}
                      className="w-full rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                      placeholder={t("form.fullName.placeholder")}
                    />
                  </Field>

                  <Field label={t("form.email.label")} hint={t("form.email.hint")}>
                    <input
                      value={form.email}
                      onChange={handleChange("email")}
                      className="w-full rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                      placeholder={t("form.email.placeholder")}
                      type="email"
                      required
                    />
                  </Field>

                  <Field label={t("form.phone.label")} hint={t("form.phone.hint")}>
                    <input
                      value={form.phone}
                      onChange={handleChange("phone")}
                      className="w-full rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                      placeholder={t("form.phone.placeholder")}
                    />
                  </Field>

                  <Field label={t("form.city.label")} hint={t("form.city.hint")}>
                    <input
                      value={form.propertyCity}
                      onChange={handleChange("propertyCity")}
                      className="w-full rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                      placeholder={t("form.city.placeholder")}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("form.purchasePrice.label")}>
                    <input
                      value={form.purchasePrice}
                      onChange={handleChange("purchasePrice")}
                      type="number"
                      min={0}
                      className="w-full rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                    />
                  </Field>

                  <Field label={t("form.equity.label")}>
                    <input
                      value={form.equity}
                      onChange={handleChange("equity")}
                      type="number"
                      min={0}
                      className="w-full rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                    />
                  </Field>

                  <Field label={t("form.interestRate.label")}>
                    <input
                      value={form.interestRate}
                      onChange={handleChange("interestRate")}
                      type="number"
                      step="0.1"
                      min={0}
                      max={30}
                      className="w-full rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                    />
                  </Field>

                  <Field label={t("form.years.label")}>
                    <input
                      value={form.years}
                      onChange={handleChange("years")}
                      type="number"
                      min={1}
                      max={40}
                      className="w-full rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                    />
                  </Field>
                </div>

                <Field label={t("form.notes.label")} hint={t("form.notes.hint")}>
                  <textarea
                    value={form.notes}
                    onChange={handleChange("notes")}
                    className="w-full min-h-[110px] rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                    placeholder={t("form.notes.placeholder")}
                  />
                </Field>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.consentContact}
                    onChange={handleChange("consentContact")}
                    className="mt-1"
                  />
                  <span className="text-xs text-slate-200">
                    {t("form.consent")}
                  </span>
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition disabled:opacity-60"
                  >
                    {loading ? t("form.submitLoading") : t("form.submit")}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/mortgage/calculator")}
                    className="inline-flex items-center justify-center rounded-full border border-slate-600 px-6 py-2.5 text-sm font-semibold hover:bg-slate-900 transition"
                  >
                    {t("form.toCalculator")}
                  </button>
                </div>

                <p className="pt-2 text-[11px] text-slate-400">
                  {t("legal")}
                </p>
              </form>
            )}
          </div>

          {/* Right: Summary / Sticky-ish card */}
          <aside className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 md:p-7 shadow-2xl">
            <h2 className="text-lg font-semibold">{t("summary.title")}</h2>

            <div className="mt-4 grid gap-3">
              <SummaryRow label={t("summary.loanAmount")} value={`${loanAmount.toLocaleString("de-DE")} €`} />
              <SummaryRow label={t("summary.monthly")} value={`${Math.round(monthlyEstimate).toLocaleString("de-DE")} €`} />
              <SummaryRow label={t("summary.years")} value={`${form.years}`} />
              <SummaryRow label={t("summary.rate")} value={`${form.interestRate}%`} />
            </div>

            <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <div className="text-sm font-semibold text-amber-200">{t("summary.disclaimerTitle")}</div>
              <div className="mt-1 text-xs text-slate-100">{t("summary.disclaimerText")}</div>
            </div>

            <div className="mt-6 space-y-2 text-xs text-slate-300">
              {(t("summary.bullets", { returnObjects: true }) || []).map((x, idx) => (
                <div key={idx}>• {x}</div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

const Field = ({ label, hint, children }) => (
  <div>
    <div className="flex items-baseline justify-between gap-3">
      <label className="text-sm font-semibold">{label}</label>
      {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

const TrustCard = ({ icon: Icon, title, text }) => (
  <div className="rounded-2xl bg-slate-950/30 border border-slate-800 px-4 py-3">
    <div className="flex items-center gap-2 mb-1">
      <span className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
        <Icon className="text-emerald-300" />
      </span>
      <div className="text-sm font-semibold">{title}</div>
    </div>
    <div className="text-xs text-slate-300">{text}</div>
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950/30 border border-slate-800 px-4 py-3">
    <div className="text-xs text-slate-300">{label}</div>
    <div className="text-sm font-semibold">{value}</div>
  </div>
);

export default MortgageRequestPage;
