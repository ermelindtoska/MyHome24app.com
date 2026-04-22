// src/pages/AgentProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import SiteMeta from "../components/SEO/SiteMeta";
import { toast } from "sonner";
import { logEvent } from "../utils/logEvent";
import AgentRatingSection from "../components/agents/AgentRatingSection";

const emptyProfile = {
  fullName: "",
  city: "",
  region: "",
  phone: "",
  languages: "",
  specialties: "",
  bio: "",
};

const AgentProfilePage = () => {
  const { t, i18n } = useTranslation("agentProfile");
  const { currentUser } = useAuth();

  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hadDoc, setHadDoc] = useState(false); // ✅ a ekziston doc-i paraprakisht?

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/agent/profile`;

  const displayNameFallback = useMemo(
    () => currentUser?.displayName || "",
    [currentUser?.displayName]
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const ref = doc(db, "agents", currentUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setHadDoc(true);
          const data = snap.data();

          setForm({
            fullName: data.fullName || displayNameFallback || "",
            city: data.city || "",
            region: data.region || "",
            phone: data.phone || "",
            languages: Array.isArray(data.languages)
              ? data.languages.join(", ")
              : data.languages || "",
            specialties: Array.isArray(data.specialties)
              ? data.specialties.join(", ")
              : data.specialties || "",
            bio: data.bio || "",
          });
        } else {
          setHadDoc(false);
          setForm((prev) => ({
            ...prev,
            fullName: displayNameFallback || "",
          }));
        }
      } catch (err) {
        console.error("[AgentProfilePage] loadProfile error:", err);
        toast.error(
          t("errors.loadProfile", {
            defaultValue: "Profil konnte nicht geladen werden.",
          })
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser?.uid, displayNameFallback, t]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const normalizeCommaList = (value) =>
    String(value || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      toast.error(
        t("errors.notLoggedIn", { defaultValue: "Bitte melde dich zuerst an." })
      );
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "agents", currentUser.uid);

      const languagesArray = normalizeCommaList(form.languages);
      const specialtiesArray = normalizeCommaList(form.specialties);

      const payload = {
        fullName: form.fullName.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
        phone: form.phone.trim(),
        languages: languagesArray,
        specialties: specialtiesArray,
        bio: form.bio.trim(),
        userId: currentUser.uid,
        email: currentUser.email || "",
        updatedAt: serverTimestamp(),
        verified: false, // admin e ndryshon kur e verifikon
      };

      // ✅ createdAt vetëm herën e parë (nëse doc nuk ka ekzistuar)
      const toSave = hadDoc
        ? payload
        : { ...payload, createdAt: serverTimestamp() };

      await setDoc(ref, toSave, { merge: true });
      setHadDoc(true);

      toast.success(
        t("success.saved", {
          defaultValue: "Maklerprofil erfolgreich gespeichert.",
        })
      );

      await logEvent({
        type: "agent.profile.saved",
        userId: currentUser.uid,
        context: "agent-profile-page",
        extra: { city: payload.city, region: payload.region },
      });
    } catch (err) {
      console.error("[AgentProfilePage] save error:", err);
      toast.error(
        t("errors.saveFailed", {
          defaultValue:
            "Beim Speichern des Profils ist ein Fehler aufgetreten.",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      ...emptyProfile,
      fullName: displayNameFallback || "",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 pt-16 md:pt-0">
      <SiteMeta
        titleKey="agentProfile.metaTitle"
        descKey="agentProfile.metaDescription"
        path="/agent/profile"
        canonical={canonical}
        lang={lang}
        noindex
      />

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {t("title", { defaultValue: "Maklerprofil bearbeiten" })}
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300">
            {t("subtitle", {
              defaultValue: "Diese Angaben werden in der Makler:innensuche angezeigt.",
            })}
          </p>
        </header>

        {/* CARD */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          {loading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("loading", { defaultValue: "Profil wird geladen…" })}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field
                label={t("fields.fullName", { defaultValue: "Vollständiger Name" })}
              >
                <input
                  type="text"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                             dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  required
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("fields.city", { defaultValue: "Stadt" })}>
                  <input
                    type="text"
                    value={form.city}
                    onChange={handleChange("city")}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none
                               focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                               dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  />
                </Field>

                <Field
                  label={t("fields.region", { defaultValue: "Region / Bundesland" })}
                >
                  <input
                    type="text"
                    value={form.region}
                    onChange={handleChange("region")}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none
                               focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                               dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  />
                </Field>
              </div>

              <Field label={t("fields.phone", { defaultValue: "Telefonnummer" })}>
                <input
                  type="text"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                             dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                />
              </Field>

              <Field
                label={t("fields.languages", {
                  defaultValue: "Sprachen (durch Komma getrennt)",
                })}
                helper={t("fields.languagesHelper", {
                  defaultValue: "Beispiel: Deutsch, Englisch, Türkisch",
                })}
              >
                <input
                  type="text"
                  value={form.languages}
                  onChange={handleChange("languages")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                             dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                />
              </Field>

              <Field
                label={t("fields.specialties", {
                  defaultValue: "Schwerpunkte (durch Komma getrennt)",
                })}
                helper={t("fields.specialtiesHelper", {
                  defaultValue:
                    "Beispiel: Eigentumswohnungen, Neubauprojekte, Kapitalanlagen",
                })}
              >
                <input
                  type="text"
                  value={form.specialties}
                  onChange={handleChange("specialties")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                             dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                />
              </Field>

              <Field
                label={t("fields.bio", { defaultValue: "Kurzprofil / Beschreibung" })}
                helper={t("fields.bioHelper", {
                  defaultValue:
                    "Beschreibe kurz deine Erfahrung, Arbeitsweise und was dich als Makler:in auszeichnet.",
                })}
              >
                <textarea
                  rows={5}
                  value={form.bio}
                  onChange={handleChange("bio")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                             dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                />
              </Field>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition
                             dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900"
                  disabled={saving}
                >
                  {t("actions.reset", { defaultValue: "Zurücksetzen" })}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
                >
                  {saving
                    ? t("actions.saving", { defaultValue: "Speichern…" })
                    : t("actions.save", { defaultValue: "Profil speichern" })}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ⭐ Ratings */}
        {currentUser?.uid && (
          <div className="mt-6">
            <AgentRatingSection agentId={currentUser.uid} agentName={form.fullName} />
          </div>
        )}
      </div>
    </main>
  );
};

const Field = ({ label, helper, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
      {label}
    </label>
    {children}
    {helper && (
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        {helper}
      </p>
    )}
  </div>
);

export default AgentProfilePage;