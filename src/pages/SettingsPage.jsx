import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { updateProfile, reload } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SiteMeta from "../components/SEO/SiteMeta";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaBirthdayCake,
  FaImage,
  FaSave,
  FaShieldAlt,
  FaGlobe,
} from "react-icons/fa";

function normalizeDateToInput(v) {
  if (!v) return "";
  if (typeof v === "string") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return v;
  }
  if (v?.toDate) return v.toDate().toISOString().slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return "";
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation("settings");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const REDIRECT_AFTER_SAVE = "/";

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    profilePicture: "",
  });

  const lang = i18n.language?.slice(0, 2) || "de";
  const canonical = `${window.location.origin}/settings`;

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      const authData = {
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        profilePicture: currentUser.photoURL || "",
        dateOfBirth: "",
      };

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));

        if (snap.exists()) {
          const data = snap.data();
          const combined = {
            displayName: data.displayName ?? authData.displayName,
            email: authData.email,
            phoneNumber: data.phoneNumber ?? authData.phoneNumber,
            dateOfBirth: normalizeDateToInput(data.dateOfBirth) || "",
            profilePicture:
              data.profilePicture ?? data.photoURL ?? authData.profilePicture,
          };

          setUserData(combined);
          setInitialData(combined);
        } else {
          setUserData(authData);
          setInitialData(authData);
        }
      } catch (error) {
        console.error("[SettingsPage] load user error:", error);
        setUserData(authData);
        setInitialData(authData);
      }
    };

    loadUserData();
  }, [currentUser]);

  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(initialData) !== JSON.stringify(userData);
  }, [initialData, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (initialData) {
      setUserData(initialData);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      await updateProfile(currentUser, {
        displayName: userData.displayName || null,
        photoURL: userData.profilePicture || null,
      });

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          email: currentUser.email,
          displayName: userData.displayName || null,
          phoneNumber: userData.phoneNumber || null,
          dateOfBirth: userData.dateOfBirth || null,
          profilePicture: userData.profilePicture || null,
          photoURL: userData.profilePicture || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      try {
        await reload(currentUser);
      } catch (reloadError) {
        console.warn("[SettingsPage] reload warning:", reloadError);
      }

      const updated = {
        ...userData,
        email: currentUser.email || userData.email,
      };

      setInitialData(updated);
      setUserData(updated);

      toast.success(
        t("profileUpdated", {
          defaultValue: "Profil erfolgreich aktualisiert!",
        })
      );

      setTimeout(() => navigate(REDIRECT_AFTER_SAVE), 700);
    } catch (err) {
      console.error("[SettingsPage] update error:", err);
      toast.error(
        t("updateFailed", {
          defaultValue: "Fehler beim Aktualisieren des Profils.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <FaShieldAlt className="text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t("title", { defaultValue: "Einstellungen" })}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t("loginRequired", {
                  defaultValue:
                    "Bitte melden Sie sich an, um auf die Einstellungen zuzugreifen.",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pt-16 md:pt-0">
      <SiteMeta
        title={t("metaTitle", {
          defaultValue: "Einstellungen – MyHome24App",
        })}
        description={t("metaDescription", {
          defaultValue:
            "Verwalten Sie Ihr Profil, Ihre Kontaktdaten und grundlegende Kontoeinstellungen auf MyHome24App.",
        })}
        canonical={canonical}
        lang={lang}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10 dark:from-blue-500/10 dark:to-emerald-500/10" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
                  <FaGlobe className="text-xs" />
                  {t("badge", { defaultValue: "Kontoeinstellungen" })}
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  {t("title", { defaultValue: "Einstellungen" })}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                  {t("description", {
                    defaultValue:
                      "Verwalten Sie Ihre persönlichen Angaben, Ihr Profilbild und Ihre grundlegenden Kontoeinstellungen.",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  {userData.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt={userData.displayName || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
                      <FaUserCircle className="text-3xl" />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {userData.displayName || t("name", { defaultValue: "Name" })}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {userData.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t("accountCardTitle", {
                  defaultValue: "Profil & Kontaktdaten",
                })}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t("accountCardText", {
                  defaultValue:
                    "Aktualisieren Sie Ihren Namen, Ihre Telefonnummer, Ihr Geburtsdatum und Ihr Profilbild.",
                })}
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <Field
                label={t("name", { defaultValue: "Name" })}
                icon={<FaUserCircle />}
              >
                <input
                  type="text"
                  name="displayName"
                  value={userData.displayName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </Field>

              <Field
                label={t("email", { defaultValue: "E-Mail" })}
                icon={<FaEnvelope />}
              >
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                />
              </Field>

              <Field
                label={t("phone", { defaultValue: "Telefonnummer" })}
                icon={<FaPhoneAlt />}
              >
                <input
                  type="tel"
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </Field>

              <Field
                label={t("dateOfBirth", { defaultValue: "Geburtsdatum" })}
                icon={<FaBirthdayCake />}
              >
                <input
                  type="date"
                  name="dateOfBirth"
                  value={normalizeDateToInput(userData.dateOfBirth)}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </Field>

              <Field
                label={t("profilePicture", {
                  defaultValue: "Profilbild",
                })}
                icon={<FaImage />}
              >
                <input
                  type="url"
                  name="profilePicture"
                  value={userData.profilePicture}
                  onChange={handleChange}
                  placeholder={t("profilePictureUrl", {
                    defaultValue: "https://...",
                  })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </Field>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading || !isDirty}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
                    loading || !isDirty
                      ? "cursor-not-allowed bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <FaSave />
                  {loading
                    ? t("saving", { defaultValue: "Speichern..." })
                    : t("saveChanges", {
                        defaultValue: "Änderungen speichern",
                      })}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!isDirty || loading}
                  className={`inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    !isDirty || loading
                      ? "cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {t("cancel", { defaultValue: "Abbrechen" })}
                </button>
              </div>
            </form>
          </section>

          <div className="space-y-6">
            <InfoCard
              title={t("securityTitle", {
                defaultValue: "Konto & Sicherheit",
              })}
              text={t("securityText", {
                defaultValue:
                  "Ihr Konto wird über Ihre E-Mail-Adresse verwaltet. Passwortänderungen und sicherheitsrelevante Schritte sollten bewusst und geschützt durchgeführt werden.",
              })}
              items={[
                t("changePassword", {
                  defaultValue: "Passwort ändern",
                }),
                t("notifications", {
                  defaultValue: "Benachrichtigungen",
                }),
                t("privacy", {
                  defaultValue: "Datenschutz",
                }),
              ]}
            />

            <InfoCard
              title={t("profileTipsTitle", {
                defaultValue: "Tipps für ein starkes Profil",
              })}
              text={t("profileTipsText", {
                defaultValue:
                  "Ein klares Profil schafft Vertrauen bei Interessent:innen, Eigentümer:innen und Partner:innen auf der Plattform.",
              })}
              items={[
                t("tip1", {
                  defaultValue: "Verwenden Sie einen klaren Anzeigenamen.",
                }),
                t("tip2", {
                  defaultValue:
                    "Hinterlegen Sie eine aktuelle Telefonnummer.",
                }),
                t("tip3", {
                  defaultValue:
                    "Nutzen Sie ein professionelles Profilbild.",
                }),
              ]}
            />

            <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                {t("helpTitle", {
                  defaultValue: "Hinweis",
                })}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {t("helpText", {
                  defaultValue:
                    "Wenn Sie Ihr Profilbild über Upload statt URL verwalten möchten, bauen wir das im nächsten Schritt direkt an Ihren bestehenden Upload-Flow an.",
                })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoCard({ title, text, items = [] }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {text}
      </p>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}