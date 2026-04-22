import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import SiteMeta from "../components/SEO/SiteMeta";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  FaLockOpen,
  FaShieldAlt,
  FaRegCheckCircle,
  FaRegClock,
  FaArrowLeft,
  FaCalculator,
  FaHandshake,
  FaFileSignature,
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
  const presetPurpose = query.get("purpose");

  const [form, setForm] = useState({
    fullName: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    consentContact: true,
    purpose: presetPurpose || "buy",
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

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.displayName || "",
        email: prev.email || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  const sanitizeNumber = (v, min = 0, max = 999999999) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  };

  const purchasePrice = sanitizeNumber(form.purchasePrice, 0);
  const equity = sanitizeNumber(form.equity, 0);
  const interestRate = sanitizeNumber(form.interestRate, 0, 30);
  const years = sanitizeNumber(form.years, 1, 40);

  const loanAmount = Math.max(0, purchasePrice - equity);

  const monthlyEstimate = useMemo(() => {
    const P = loanAmount;
    const annual = interestRate / 100;
    const r = annual / 12;
    const n = years * 12;

    if (!P || !n) return 0;
    if (!r) return P / n;

    const monthly = (P * r) / (1 - Math.pow(1 + r, -n));
    return Number.isFinite(monthly) ? monthly : 0;
  }, [loanAmount, interestRate, years]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (error) setError("");
  };

  const validateForm = () => {
    if (!String(form.fullName || "").trim()) {
      return t("form.errors.fullName", {
        defaultValue: "Bitte geben Sie Ihren vollständigen Namen ein.",
      });
    }

    if (!String(form.email || "").trim() || !String(form.email).includes("@")) {
      return t("form.errors.email", {
        defaultValue: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      });
    }

    if (purchasePrice <= 0) {
      return t("form.errors.purchasePrice", {
        defaultValue: "Bitte geben Sie einen gültigen Kaufpreis ein.",
      });
    }

    if (equity < 0) {
      return t("form.errors.equity", {
        defaultValue: "Das Eigenkapital darf nicht negativ sein.",
      });
    }

    if (equity > purchasePrice) {
      return t("form.errors.equityTooHigh", {
        defaultValue: "Das Eigenkapital darf nicht höher als der Kaufpreis sein.",
      });
    }

    if (interestRate < 0 || interestRate > 30) {
      return t("form.errors.interestRate", {
        defaultValue: "Bitte geben Sie einen realistischen Zinssatz ein.",
      });
    }

    if (years < 1 || years > 40) {
      return t("form.errors.years", {
        defaultValue: "Bitte wählen Sie eine Laufzeit zwischen 1 und 40 Jahren.",
      });
    }

    if (!form.consentContact) {
      return t("form.errors.consent", {
        defaultValue: "Bitte stimmen Sie der Kontaktaufnahme zu.",
      });
    }

    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: currentUser?.uid ?? null,
        userEmail: currentUser?.email ?? null,
        fullName: String(form.fullName || "").trim(),
        email: String(form.email || "").trim(),
        phone: String(form.phone || "").trim() || null,
        purpose: String(form.purpose || "buy"),
        purchasePrice,
        equity,
        loanAmount,
        interestRate,
        years,
        monthlyEstimate: Math.round(monthlyEstimate),
        propertyCity: String(form.propertyCity || "").trim() || null,
        notes: String(form.notes || "").trim() || null,
        consentContact: !!form.consentContact,
        status: "new",
        createdAt: serverTimestamp(),
        source: "mortgage_request_page",
        locale: lang,
      };

      const ref = await addDoc(collection(db, "financeRequests"), payload);
      setDoneId(ref.id);
      setError("");
    } catch (err) {
      console.error("[MortgageRequestPage] submit error:", err);
      setError(
        t("form.errors.generic", {
          defaultValue:
            "Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <SiteMeta
        title={t("metaTitle", {
          defaultValue: "Finanzierungsanfrage – MyHome24App",
        })}
        description={t("metaDescription", {
          defaultValue:
            "Senden Sie Ihre unverbindliche Finanzierungsanfrage sicher und digital an MyHome24App.",
        })}
        canonical={canonical}
        lang={lang}
        ogImage={`${window.location.origin}/og/og-mortgage-request.jpg`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <FaArrowLeft />
            {t("back", { defaultValue: "Zurück" })}
          </button>

          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <FaLockOpen />
            {t("badgeNoLogin", {
              defaultValue: "Auch ohne Login möglich",
            })}
          </span>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.08fr,0.92fr] items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900/70">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {t("title", { defaultValue: "Finanzierungsanfrage senden" })}
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              {t("subtitle", {
                defaultValue:
                  "Übermitteln Sie Ihre Eckdaten sicher und unverbindlich. So können passende Finanzierungspartner:innen vorbereitet werden.",
              })}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <TrustCard
                icon={FaShieldAlt}
                title={t("trust.0.title", { defaultValue: "Sicher" })}
                text={t("trust.0.text", {
                  defaultValue: "Ihre Angaben werden strukturiert und vertraulich verarbeitet.",
                })}
              />
              <TrustCard
                icon={FaRegClock}
                title={t("trust.1.title", { defaultValue: "Schnell" })}
                text={t("trust.1.text", {
                  defaultValue: "Die Anfrage ist in wenigen Minuten ausgefüllt.",
                })}
              />
              <TrustCard
                icon={FaRegCheckCircle}
                title={t("trust.2.title", { defaultValue: "Unverbindlich" })}
                text={t("trust.2.text", {
                  defaultValue: "Sie erhalten zunächst eine erste Einschätzung ohne Verpflichtung.",
                })}
              />
            </div>

            {doneId ? (
              <div className="mt-7 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5">
                <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-200">
                  {t("success.title", {
                    defaultValue: "Anfrage erfolgreich übermittelt",
                  })}
                </h2>

                <p className="mt-2 text-sm text-slate-700 dark:text-slate-100">
                  {t("success.text", {
                    defaultValue:
                      "Vielen Dank. Ihre Anfrage wurde gespeichert und kann nun intern weiterverarbeitet werden.",
                  })}
                </p>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  {t("success.ref", { defaultValue: "Referenznummer:" })}{" "}
                  <span className="font-mono">{doneId}</span>
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/mortgage/calculator")}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    <FaCalculator className="mr-2" />
                    {t("success.ctaCalculator", {
                      defaultValue: "Zum Hypothekenrechner",
                    })}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/mortgage/partners")}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <FaHandshake className="mr-2" />
                    {t("success.ctaPartners", {
                      defaultValue: "Partner:innen ansehen",
                    })}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-7 space-y-5">
                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
                    {error}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label={t("form.fullName.label", {
                      defaultValue: "Vollständiger Name",
                    })}
                    hint={t("form.fullName.hint", {
                      defaultValue: "Wie sollen wir Sie ansprechen?",
                    })}
                  >
                    <input
                      value={form.fullName}
                      onChange={handleChange("fullName")}
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                      placeholder={t("form.fullName.placeholder", {
                        defaultValue: "Max Mustermann",
                      })}
                    />
                  </Field>

                  <Field
                    label={t("form.email.label", {
                      defaultValue: "E-Mail-Adresse",
                    })}
                    hint={t("form.email.hint", {
                      defaultValue: "Für Rückfragen und Rückmeldung",
                    })}
                  >
                    <input
                      value={form.email}
                      onChange={handleChange("email")}
                      type="email"
                      required
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                      placeholder={t("form.email.placeholder", {
                        defaultValue: "name@example.com",
                      })}
                    />
                  </Field>

                  <Field
                    label={t("form.phone.label", {
                      defaultValue: "Telefonnummer",
                    })}
                    hint={t("form.phone.hint", {
                      defaultValue: "Optional, aber hilfreich",
                    })}
                  >
                    <input
                      value={form.phone}
                      onChange={handleChange("phone")}
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                      placeholder={t("form.phone.placeholder", {
                        defaultValue: "+49 …",
                      })}
                    />
                  </Field>

                  <Field
                    label={t("form.city.label", {
                      defaultValue: "Ort der Immobilie",
                    })}
                    hint={t("form.city.hint", {
                      defaultValue: "Optional für bessere Einordnung",
                    })}
                  >
                    <input
                      value={form.propertyCity}
                      onChange={handleChange("propertyCity")}
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                      placeholder={t("form.city.placeholder", {
                        defaultValue: "z. B. Berlin",
                      })}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label={t("form.purchasePrice.label", {
                      defaultValue: "Kaufpreis",
                    })}
                  >
                    <input
                      value={form.purchasePrice}
                      onChange={handleChange("purchasePrice")}
                      type="number"
                      min={0}
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    />
                  </Field>

                  <Field
                    label={t("form.equity.label", {
                      defaultValue: "Eigenkapital",
                    })}
                  >
                    <input
                      value={form.equity}
                      onChange={handleChange("equity")}
                      type="number"
                      min={0}
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    />
                  </Field>

                  <Field
                    label={t("form.interestRate.label", {
                      defaultValue: "Zinssatz in %",
                    })}
                  >
                    <input
                      value={form.interestRate}
                      onChange={handleChange("interestRate")}
                      type="number"
                      step="0.1"
                      min={0}
                      max={30}
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    />
                  </Field>

                  <Field
                    label={t("form.years.label", {
                      defaultValue: "Laufzeit in Jahren",
                    })}
                  >
                    <input
                      value={form.years}
                      onChange={handleChange("years")}
                      type="number"
                      min={1}
                      max={40}
                      className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    />
                  </Field>
                </div>

                <Field
                  label={t("form.notes.label", {
                    defaultValue: "Zusätzliche Hinweise",
                  })}
                  hint={t("form.notes.hint", {
                    defaultValue: "Optional, z. B. besondere Situation oder Rückfragen",
                  })}
                >
                  <textarea
                    value={form.notes}
                    onChange={handleChange("notes")}
                    className="w-full min-h-[120px] rounded-xl bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/40 dark:border-slate-700 dark:text-slate-100"
                    placeholder={t("form.notes.placeholder", {
                      defaultValue: "Geben Sie hier weitere Informationen ein …",
                    })}
                  />
                </Field>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/30">
                  <input
                    type="checkbox"
                    checked={form.consentContact}
                    onChange={handleChange("consentContact")}
                    className="mt-1"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    {t("form.consent", {
                      defaultValue:
                        "Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Finanzierungsanfrage und zur Kontaktaufnahme verwendet werden dürfen.",
                    })}
                  </span>
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition disabled:opacity-60"
                  >
                    <FaFileSignature className="mr-2" />
                    {loading
                      ? t("form.submitLoading", {
                          defaultValue: "Wird gesendet …",
                        })
                      : t("form.submit", {
                          defaultValue: "Anfrage sicher absenden",
                        })}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/mortgage/calculator")}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <FaCalculator className="mr-2" />
                    {t("form.toCalculator", {
                      defaultValue: "Zum Rechner",
                    })}
                  </button>
                </div>

                <p className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {t("legal", {
                    defaultValue:
                      "Hinweis: Diese Anfrage stellt noch kein verbindliches Finanzierungsangebot dar.",
                  })}
                </p>
              </form>
            )}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 md:p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {t("summary.title", {
                defaultValue: "Ihre aktuelle Übersicht",
              })}
            </h2>

            <div className="mt-4 grid gap-3">
              <SummaryRow
                label={t("summary.loanAmount", {
                  defaultValue: "Darlehenssumme",
                })}
                value={formatCurrency(loanAmount)}
              />
              <SummaryRow
                label={t("summary.monthly", {
                  defaultValue: "Geschätzte Monatsrate",
                })}
                value={formatCurrency(Math.round(monthlyEstimate))}
                highlight
              />
              <SummaryRow
                label={t("summary.years", {
                  defaultValue: "Laufzeit",
                })}
                value={`${years} ${t("summary.yearsSuffix", {
                  defaultValue: "Jahre",
                })}`}
              />
              <SummaryRow
                label={t("summary.rate", {
                  defaultValue: "Zinssatz",
                })}
                value={`${interestRate}%`}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {t("summary.disclaimerTitle", {
                  defaultValue: "Wichtiger Hinweis",
                })}
              </div>
              <div className="mt-1 text-xs text-amber-700 dark:text-slate-100">
                {t("summary.disclaimerText", {
                  defaultValue:
                    "Die dargestellten Werte dienen nur als Orientierung und ersetzen keine individuelle Finanzierungsprüfung.",
                })}
              </div>
            </div>

            <div className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {(t("summary.bullets", { returnObjects: true }) || []).map(
                (item, idx) => (
                  <div key={idx}>• {item}</div>
                )
              )}
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
      <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </label>
      {hint ? (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

const TrustCard = ({ icon: Icon, title, text }) => (
  <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 dark:bg-slate-950/30 dark:border-slate-800">
    <div className="flex items-center gap-2 mb-1">
      <span className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
        <Icon className="text-emerald-600 dark:text-emerald-300" />
      </span>
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </div>
    </div>
    <div className="text-xs text-slate-600 dark:text-slate-300">{text}</div>
  </div>
);

const SummaryRow = ({ label, value, highlight = false }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 dark:bg-slate-950/30 dark:border-slate-800">
    <div className="text-xs text-slate-600 dark:text-slate-300">{label}</div>
    <div
      className={`text-sm font-semibold ${
        highlight
          ? "text-emerald-600 dark:text-emerald-300"
          : "text-slate-900 dark:text-slate-100"
      }`}
    >
      {value}
    </div>
  </div>
);

export default MortgageRequestPage;