// src/pages/MortgageCalculatorPage.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SiteMeta from "../components/SEO/SiteMeta";
import calculatorImg from "../assets/mortgage-calculator.png";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createFinanceLeadFromCalculator } from "../services/financePartnerService";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";


const MortgageCalculatorPage = () => {
  const { t, i18n } = useTranslation("mortgageCalculator");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // --------- i18n Arrays robust holen ---------
  const rawFeatures = t("features", { returnObjects: true });
  const rawLegalNotes = t("legalNotes", { returnObjects: true });
  const rawPartnerCallouts = t("partnerCallouts", { returnObjects: true });

  const features = Array.isArray(rawFeatures) ? rawFeatures : [];
  const legalNotes = Array.isArray(rawLegalNotes) ? rawLegalNotes : [];
  const partnerCallouts = Array.isArray(rawPartnerCallouts)
    ? rawPartnerCallouts
    : [];

  // --------- Formular-State ---------
  const [purchasePrice, setPurchasePrice] = useState(450000);
  const [downPayment, setDownPayment] = useState(90000);
  const [interest, setInterest] = useState(3.2); // % p.a.
  const [termYears, setTermYears] = useState(30);

  // --------- Berechnung ---------
  const result = useMemo(() => {
    const price = Number(purchasePrice) || 0;
    const down = Number(downPayment) || 0;
    const rate = Number(interest) || 0;
    const years = Number(termYears) || 0;

    const loan = Math.max(price - down, 0);
    const n = years * 12;
    const r = rate / 100 / 12;

    if (!loan || !n) {
      return {
        monthly: 0,
        totalInterest: 0,
        totalPayment: 0,
        loanAmount: 0,
      };
    }

    let monthly = 0;
    if (r === 0) {
      monthly = loan / n;
    } else {
      const factor = Math.pow(1 + r, n);
      monthly = (loan * r * factor) / (factor - 1);
    }

    const totalPayment = monthly * n;
    const totalInterest = totalPayment - loan;

    return {
      monthly,
      totalInterest,
      totalPayment,
      loanAmount: loan,
    };
  }, [purchasePrice, downPayment, interest, termYears]);

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/mortgage/calculator`;
const saveFinanceLead = async (payload) => {
  try {
    await addDoc(collection(db, "financeLeads"), {
      userId: currentUser?.uid || null,
      status: "open",
      source: "mortgageCalculator",
      createdAt: serverTimestamp(),
      ...payload,
    });
    console.log("[financeLead] OK");
  } catch (err) {
    console.error("[financeLead] Fehler beim Speichern:", err);
  }
};
  // Hilfsfunktion für Euro-Format
  const formatCurrency = (value) =>
    new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value || 0);

    const handleSendFinanceRequest = async () => {
  try {
    await createFinanceLeadFromCalculator({
      userId: currentUser ? currentUser.uid : null,
      purchasePrice,
      downPayment,
      interest,
      termYears,
      // më vonë mund të shtosh edhe city, postalCode, note nga një form tjetër
      city: "",
      postalCode: "",
      note: "",
      assignedPartnerId: null // do e caktojmë më vonë në admin / routing
    });

    toast.success(
      t("partner.leadSuccess", {
        defaultValue:
          "Ihre Finanzierungsanfrage wurde als Orientierung gespeichert. Wir melden uns, sobald ein passender Finanzierungspartner angebunden ist.",
      })
    );
  } catch (error) {
    console.error("[MortgageCalculator] lead error", error);
    toast.error(
      t("partner.leadError", {
        defaultValue:
          "Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.",
      })
    );
  }
};


  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* SEO */}
      <SiteMeta
        title={t("metaTitle")}
        description={t("metaDescription")}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-mortgage-calculator.jpg`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        {/* HERO + Formular */}
        <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-start">
          {/* Bild / Hero */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <img
              src={calculatorImg}
              alt={t("hero.imgAlt")}
              className="w-full h-[320px] md:h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            <img
              src={logo}
              alt="MyHome24App"
              className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
            />

            <div className="absolute left-6 right-6 bottom-6 space-y-3">
              <span className="inline-flex items-center rounded-full bg-blue-500/90 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                {t("hero.badge")}
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                {t("hero.title")}
              </h1>
              <p className="text-sm md:text-base text-slate-200 max-w-xl">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>

          {/* Formular */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5 shadow-xl">
            <h2 className="text-lg md:text-xl font-semibold mb-2">
              {t("form.title")}
            </h2>

            <div className="space-y-4">
              {/* Kaufpreis */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("form.purchasePriceLabel")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-2.5 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("form.purchasePricePlaceholder")}
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-xs text-slate-400">
                    €
                  </span>
                </div>
              </div>

              {/* Eigenkapital */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t("form.downPaymentLabel")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-2.5 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("form.downPaymentPlaceholder")}
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-xs text-slate-400">
                    €
                  </span>
                </div>
              </div>

              {/* Zinssatz */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t("form.interestLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                {/* Laufzeit */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t("form.termLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={termYears}
                      onChange={(e) => setTermYears(e.target.value)}
                      className="w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                      {t("form.termSuffix")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
  <button
    type="button"
    onClick={handleSendFinanceRequest}
    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition"
  >
    {t("partner.buttonSendLead", {
      defaultValue: "Unverbindliche Finanzierungsanfrage speichern",
    })}
  </button>

  <button
    type="button"
    onClick={() => navigate("/mortgage/partners")}
    className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
  >
    {t("partner.buttonSeePartners", {
      defaultValue: "Mehr über Finanzierungspartner:innen",
    })}
  </button>
  
</div>


              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  {t("form.calculateButton")}
                </button>
<button
  type="button"
  onClick={() => {
    saveFinanceLead({
      purchasePrice,
      downPayment,
      interest,
      termYears,
      monthlyPayment: result.monthly,
      totalInterest: result.totalInterest,
      notes: null,
    });
    navigate("/mortgage/partners");
  }}
  className="px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
>
  {t("partner.buttonBecomePartner")}
</button>

                
                <button
                  type="button"
                  onClick={() => {
                    setPurchasePrice(450000);
                    setDownPayment(90000);
                    setInterest(3.2);
                    setTermYears(30);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 transition"
                >
                  {t("form.resetButton")}
                </button>
                <button
  type="button"
  onClick={() => navigate("/partner/finance")}
  className="px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
>
  {t("partner.buttonBecomePartner")}
</button>

<button
  type="button"
  onClick={() => navigate("/contact?topic=financing")}
  className="px-5 py-2.5 rounded-full border border-slate-600 text-sm font-semibold hover:bg-slate-900 transition"
>
  {t("partner.buttonContactPlatform")}
</button>
              </div>
            </div>

            {/* Ergebnisse */}
            <div className="mt-4 rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">
                {t("results.title")}
              </h3>
              <p className="text-xs text-slate-400">{t("results.disclaimer")}</p>
              <div className="grid grid-cols-2 gap-3 text-sm md:text-base">
                <ResultBox
                  label={t("results.monthlyPayment")}
                  value={formatCurrency(result.monthly)}
                  highlight
                />
                <ResultBox
                  label={t("results.loanAmount")}
                  value={formatCurrency(result.loanAmount)}
                />
                <ResultBox
                  label={t("results.totalInterest")}
                  value={formatCurrency(result.totalInterest)}
                />
                <ResultBox
                  label={t("results.totalPayment")}
                  value={formatCurrency(result.totalPayment)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Features + Rechtliches */}
        <section className="mt-12 md:mt-16 grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
          {/* Features */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              {t("featuresTitle")}
            </h2>
            <div className="space-y-3">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3"
                >
                  <h3 className="text-sm font-semibold text-slate-50">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rechtliches / Hinweise */}
          <aside className="rounded-3xl bg-amber-500/10 border border-amber-500/40 px-4 py-4 md:px-5 md:py-5">
            <h2 className="text-lg font-semibold text-amber-400 mb-2">
              {t("legalTitle")}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-amber-100">
              {legalNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </aside>
        </section>

        {/* Partner-Sektion: Finanzierungsberater:innen / Banken */}
        <section className="mt-12 md:mt-16 rounded-3xl bg-slate-900/80 border border-slate-800 px-5 py-6 md:px-6 md:py-7">
          <h2 className="text-lg md:text-xl font-semibold mb-3">
            {t("partnerSection.title")}
          </h2>
          <p className="text-sm md:text-base text-slate-200 mb-4">
            {t("partnerSection.text")}
          </p>

          <div className="grid gap-4 md:grid-cols-3 mb-5">
            {partnerCallouts.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950/70 border border-slate-800 px-4 py-3 text-xs md:text-sm"
              >
                <h3 className="font-semibold mb-1 text-slate-50">
                  {item.title}
                </h3>
                <p className="text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/partner/finance"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
            >
              {t("partnerSection.ctaPrimary")}
            </a>
            <a
              href="/contact?topic=financing"
              className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition"
            >
              {t("partnerSection.ctaSecondary")}
            </a>
          </div>
        </section>
        
      </div>
      
    </div>
  );
};

const ResultBox = ({ label, value, highlight = false }) => (
  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-3 py-3">
    <div className="text-[11px] md:text-xs text-slate-400 mb-1">{label}</div>
    <div
      className={`text-sm md:text-lg font-semibold ${
        highlight ? "text-emerald-400" : "text-slate-50"
      }`}
    >
      {value}
    </div>
  </div>
  
);

export default MortgageCalculatorPage;
