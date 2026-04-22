import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCalculator,
  FaEuroSign,
  FaPercent,
  FaRegClock,
  FaHandshake,
  FaArrowRight,
  FaShieldAlt,
  FaChartLine,
} from "react-icons/fa";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import SiteMeta from "../components/SEO/SiteMeta";
import calculatorImg from "../assets/mortgage-calculator.png";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

const DEFAULT_VALUES = {
  purchasePrice: 450000,
  downPayment: 90000,
  interest: 3.2,
  termYears: 30,
};

const MortgageCalculatorPage = () => {
  const { t, i18n } = useTranslation("mortgageCalculator");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/mortgage/calculator`;

  const rawFeatures = t("features", { returnObjects: true });
  const rawLegalNotes = t("legalNotes", { returnObjects: true });
  const rawPartnerCallouts = t("partnerCallouts", { returnObjects: true });

  const features = Array.isArray(rawFeatures) ? rawFeatures : [];
  const legalNotes = Array.isArray(rawLegalNotes) ? rawLegalNotes : [];
  const partnerCallouts = Array.isArray(rawPartnerCallouts)
    ? rawPartnerCallouts
    : [];

  const [purchasePrice, setPurchasePrice] = useState(DEFAULT_VALUES.purchasePrice);
  const [downPayment, setDownPayment] = useState(DEFAULT_VALUES.downPayment);
  const [interest, setInterest] = useState(DEFAULT_VALUES.interest);
  const [termYears, setTermYears] = useState(DEFAULT_VALUES.termYears);
  const [savingLead, setSavingLead] = useState(false);

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
        equityRatio: 0,
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
    const equityRatio = price > 0 ? (down / price) * 100 : 0;

    return {
      monthly,
      totalInterest,
      totalPayment,
      loanAmount: loan,
      equityRatio,
    };
  }, [purchasePrice, downPayment, interest, termYears]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatPercent = (value) =>
    new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(Number(value) || 0);

  const saveFinanceLead = async (payload) => {
    await addDoc(collection(db, "financeLeads"), {
      userId: currentUser?.uid || null,
      status: "open",
      source: "mortgageCalculator",
      createdAt: serverTimestamp(),
      ...payload,
    });
  };

  const handleSendFinanceRequest = async () => {
    if (!currentUser) {
      toast.info(
        t("partner.loginRequired", {
          defaultValue:
            "Bitte melden Sie sich an, um eine Finanzierungsanfrage zu senden.",
        })
      );
      navigate("/login?next=/mortgage/calculator");
      return;
    }

    try {
      setSavingLead(true);

      const payload = {
        purchasePrice: Number(purchasePrice) || 0,
        downPayment: Number(downPayment) || 0,
        interest: Number(interest) || 0,
        termYears: Number(termYears) || 0,
        monthlyPayment: result.monthly,
        totalInterest: result.totalInterest,
        totalPayment: result.totalPayment,
        loanAmount: result.loanAmount,
        city: "",
        postalCode: "",
        note: "",
        assignedPartnerId: null,
        lang,
      };

      await saveFinanceLead(payload);

      toast.success(
        t("partner.leadSuccess", {
          defaultValue:
            "Ihre Finanzierungsanfrage wurde gespeichert. Wir melden uns, sobald ein passender Finanzierungspartner angebunden ist.",
        })
      );
    } catch (error) {
      console.error("[MortgageCalculatorPage] lead save error:", error);
      toast.error(
        t("partner.leadError", {
          defaultValue:
            "Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.",
        })
      );
    } finally {
      setSavingLead(false);
    }
  };

  const handleReset = () => {
    setPurchasePrice(DEFAULT_VALUES.purchasePrice);
    setDownPayment(DEFAULT_VALUES.downPayment);
    setInterest(DEFAULT_VALUES.interest);
    setTermYears(DEFAULT_VALUES.termYears);
  };

  const handleOpenPartners = () => navigate("/mortgage/partners");
  const handleBecomePartner = () => navigate("/partner/finance");
  const handleContactPlatform = () => navigate("/contact?topic=financing");
  const handleGoToRequest = () => navigate("/mortgage/request");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("metaTitle", {
          defaultValue: "Hypothekenrechner – MyHome24App",
        })}
        description={t("metaDescription", {
          defaultValue:
            "Berechnen Sie Ihre monatliche Rate, prüfen Sie Eigenkapital und senden Sie direkt eine unverbindliche Finanzierungsanfrage.",
        })}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-mortgage-calculator.jpg`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.08fr,0.92fr] items-start">
          {/* LEFT HERO */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <img
                src={calculatorImg}
                alt={t("hero.imgAlt", {
                  defaultValue: "Hypothekenrechner von MyHome24App",
                })}
                className="h-[320px] md:h-[420px] w-full object-cover"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              <img
                src={logo}
                alt="MyHome24App"
                className="absolute top-4 right-4 h-10 w-auto drop-shadow-lg"
              />

              <div className="absolute left-6 right-6 bottom-6 space-y-3">
                <span className="inline-flex items-center rounded-full bg-blue-600/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  <FaCalculator className="mr-2" />
                  {t("hero.badge", { defaultValue: "Finanzierung" })}
                </span>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug text-white">
                  {t("hero.title", {
                    defaultValue: "Hypothek berechnen und Finanzierung planen",
                  })}
                </h1>

                <p className="max-w-xl text-sm md:text-base text-slate-200">
                  {t("hero.subtitle", {
                    defaultValue:
                      "Berechnen Sie Ihre monatliche Rate in wenigen Sekunden und senden Sie bei Bedarf direkt eine unverbindliche Anfrage.",
                  })}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniInfoCard
                icon={<FaEuroSign />}
                title={t("miniCards.0.title", {
                  defaultValue: "Klare Monatsrate",
                })}
                text={t("miniCards.0.text", {
                  defaultValue: "Sofort sehen, was monatlich realistisch ist.",
                })}
              />
              <MiniInfoCard
                icon={<FaPercent />}
                title={t("miniCards.1.title", {
                  defaultValue: "Zinsen vergleichen",
                })}
                text={t("miniCards.1.text", {
                  defaultValue: "Verschiedene Zinssätze schnell testen.",
                })}
              />
              <MiniInfoCard
                icon={<FaRegClock />}
                title={t("miniCards.2.title", {
                  defaultValue: "Laufzeit verstehen",
                })}
                text={t("miniCards.2.text", {
                  defaultValue: "Sehen, wie sich Jahre auf Ihre Rate auswirken.",
                })}
              />
            </div>
          </div>

          {/* RIGHT CALCULATOR */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900/90 md:p-6">
            <div className="mb-5">
              <h2 className="text-lg md:text-xl font-semibold">
                {t("form.title", {
                  defaultValue: "Ihre Finanzierung berechnen",
                })}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {t("form.subtitle", {
                  defaultValue:
                    "Passen Sie Kaufpreis, Eigenkapital, Zinssatz und Laufzeit an.",
                })}
              </p>
            </div>

            <div className="space-y-4">
              <InputField
                label={t("form.purchasePriceLabel", {
                  defaultValue: "Kaufpreis",
                })}
                suffix="€"
                value={purchasePrice}
                onChange={setPurchasePrice}
                min={0}
                placeholder={t("form.purchasePricePlaceholder", {
                  defaultValue: "z. B. 450000",
                })}
              />

              <InputField
                label={t("form.downPaymentLabel", {
                  defaultValue: "Eigenkapital",
                })}
                suffix="€"
                value={downPayment}
                onChange={setDownPayment}
                min={0}
                placeholder={t("form.downPaymentPlaceholder", {
                  defaultValue: "z. B. 90000",
                })}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={t("form.interestLabel", {
                    defaultValue: "Sollzins p.a.",
                  })}
                  suffix="%"
                  value={interest}
                  onChange={setInterest}
                  min={0}
                  step="0.01"
                />

                <InputField
                  label={t("form.termLabel", {
                    defaultValue: "Laufzeit",
                  })}
                  suffix={t("form.termSuffix", {
                    defaultValue: "Jahre",
                  })}
                  value={termYears}
                  onChange={setTermYears}
                  min={1}
                  max={40}
                />
              </div>
            </div>

            {/* RESULTS */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t("results.title", {
                      defaultValue: "Ihre Ergebnisübersicht",
                    })}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t("results.disclaimer", {
                      defaultValue:
                        "Unverbindliche Beispielrechnung. Finale Konditionen können abweichen.",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t("results.live", { defaultValue: "Live" })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ResultBox
                  label={t("results.monthlyPayment", {
                    defaultValue: "Monatliche Rate",
                  })}
                  value={formatCurrency(result.monthly)}
                  highlight
                />
                <ResultBox
                  label={t("results.loanAmount", {
                    defaultValue: "Finanzierungsbetrag",
                  })}
                  value={formatCurrency(result.loanAmount)}
                />
                <ResultBox
                  label={t("results.totalInterest", {
                    defaultValue: "Gesamtzinsen",
                  })}
                  value={formatCurrency(result.totalInterest)}
                />
                <ResultBox
                  label={t("results.totalPayment", {
                    defaultValue: "Gesamtzahlung",
                  })}
                  value={formatCurrency(result.totalPayment)}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/50 dark:bg-blue-950/30">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {t("results.equityRatio", {
                    defaultValue: "Eigenkapitalquote",
                  })}
                </div>
                <div className="mt-1 text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {formatPercent(result.equityRatio)}%
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSendFinanceRequest}
                disabled={savingLead}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingLead
                  ? t("partner.sendingLead", {
                      defaultValue: "Wird gespeichert…",
                    })
                  : t("partner.buttonSendLead", {
                      defaultValue: "Finanzierungsanfrage senden",
                    })}
                <FaArrowRight className="ml-2" />
              </button>

              <button
                type="button"
                onClick={handleGoToRequest}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {t("partner.directRequest", {
                  defaultValue: "Direkt zur Anfrage",
                })}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("form.resetButton", {
                  defaultValue: "Zurücksetzen",
                })}
              </button>
            </div>

            {!currentUser && (
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {t("partner.loginHint", {
                  defaultValue:
                    "Für eine echte Finanzierungsanfrage melden Sie sich bitte an.",
                })}
              </p>
            )}
          </section>
        </section>

        {/* FEATURES + LEGAL */}
        <section className="mt-12 grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
          <div>
            <h2 className="mb-3 text-lg md:text-xl font-semibold">
              {t("featuresTitle", {
                defaultValue: "Warum dieser Rechner hilfreich ist",
              })}
            </h2>

            <div className="space-y-3">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-amber-300 bg-amber-50 px-5 py-5 dark:border-amber-500/40 dark:bg-amber-500/10">
            <div className="mb-3 flex items-center gap-2">
              <FaShieldAlt className="text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                {t("legalTitle", {
                  defaultValue: "Wichtige Hinweise",
                })}
              </h2>
            </div>

            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-amber-900 dark:text-amber-100">
              {legalNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </aside>
        </section>

        {/* PARTNER SECTION */}
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:px-6 md:py-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-semibold">
                {t("partnerSection.title", {
                  defaultValue: "Finanzierungspartner:innen & Zusammenarbeit",
                })}
              </h2>
              <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-700 dark:text-slate-200">
                {t("partnerSection.text", {
                  defaultValue:
                    "Wir bauen eine professionelle Infrastruktur für Finanzierungspartner:innen und Kund:innen auf – transparent, schnell und modern.",
                })}
              </p>
            </div>

            <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <FaHandshake className="mr-2" />
              {t("partnerSection.badge", {
                defaultValue: "Partnernetzwerk im Ausbau",
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {partnerCallouts.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70"
              >
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBecomePartner}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              {t("partnerSection.ctaPrimary", {
                defaultValue: "Finanzierungspartner:in werden",
              })}
            </button>

            <button
              type="button"
              onClick={handleOpenPartners}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <FaChartLine className="mr-2" />
              {t("partner.buttonSeePartners", {
                defaultValue: "Partner:innen ansehen",
              })}
            </button>

            <button
              type="button"
              onClick={handleContactPlatform}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {t("partnerSection.ctaSecondary", {
                defaultValue: "Plattform kontaktieren",
              })}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
  placeholder,
}) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 pr-16 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      />
      <span className="absolute inset-y-0 right-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
        {suffix}
      </span>
    </div>
  </div>
);

const ResultBox = ({ label, value, highlight = false }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900/80">
    <div className="mb-1 text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
      {label}
    </div>
    <div
      className={`text-sm md:text-lg font-semibold ${
        highlight
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-slate-900 dark:text-slate-50"
      }`}
    >
      {value}
    </div>
  </div>
);

const MiniInfoCard = ({ icon, title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
      {title}
    </h3>
    <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
      {text}
    </p>
  </div>
);

export default MortgageCalculatorPage;