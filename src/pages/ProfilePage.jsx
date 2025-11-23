// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AccountSidebar from "../components/profile/AccountSidebar";
import AvatarUploader from "../components/profile/AvatarUploader";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { t } = useTranslation("profile");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const tab = sp.get("tab") || "profile";

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  // Kontaktanfragen (Messages-Tab)
  const [contactRequests, setContactRequests] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // ---- Daten laden (Auth + Firestore)
  async function load() {
    try {
      if (!currentUser) {
        setFetchError(t("error.notLoggedIn") || "Du bist abgemeldet.");
        setLoading(false);
        return;
      }
      const authData = {
        email: currentUser.email || "",
        displayName: currentUser.displayName || "",
        photoURL: currentUser.photoURL || "",
        phoneNumber: currentUser.phoneNumber || "",
      };
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      const fs = snap.exists() ? snap.data() : {};
      const combined = {
        email: authData.email,
        photoURL: fs.photoURL ?? authData.photoURL ?? "",
        displayName: fs.displayName ?? authData.displayName ?? "",
        firstName: fs.firstName ?? "",
        lastName: fs.lastName ?? "",
        phoneNumber: fs.phoneNumber ?? authData.phoneNumber ?? "",
        dateOfBirth: fs.dateOfBirth ?? "",
        location: fs.location ?? "",
        bio: fs.bio ?? "",
        role: fs.role ?? "user",
        listings: Array.isArray(fs.listings) ? fs.listings : [],
        messages: Array.isArray(fs.messages) ? fs.messages : [],
      };
      setUserData(combined);
      setForm(combined);
      setLoading(false);
    } catch (e) {
      console.error("[Profile] load error:", e);
      setFetchError(
        t("error.loadFailed") || "Fehler beim Laden der Profildaten."
      );
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  // ---- Kontaktanfragen aus Firestore laden (nur im messages-Tab)
  useEffect(() => {
    if (!currentUser || tab !== "messages") return;

    setMessagesLoading(true);
    const q = query(
      collection(db, "contacts"),
      where("ownerEmail", "==", currentUser.email),
      orderBy("sentAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setContactRequests(data);
        setMessagesLoading(false);
      },
      (err) => {
        console.error("[Profile] contacts listener error:", err);
        setMessagesLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser?.email, currentUser?.uid, tab]);

  // ---- Statistiken
  const stats = useMemo(() => {
    const lst = userData?.listings || [];
    const published = lst.filter((x) => x?.status === "published").length;
    const pending = lst.filter((x) => x?.status === "pending").length;
    const rejected = lst.filter((x) => x?.status === "rejected").length;
    return {
      total: lst.length,
      published,
      pending,
      rejected,
    };
  }, [userData]);

  // ---- Dirty-State
  const dirty = useMemo(() => {
    if (!userData) return false;
    const a = { ...userData };
    const b = { ...form };
    delete a.listings;
    delete a.messages;
    delete b.listings;
    delete b.messages;
    return JSON.stringify(a) !== JSON.stringify(b);
  }, [userData, form]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // ---- Helpers
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.displayName?.trim() && !(form.firstName || form.lastName)) {
      e.displayName =
        t("error.nameRequired") || "Name ist erforderlich.";
    }
    if (form.dateOfBirth) {
      const d = new Date(form.dateOfBirth);
      if (Number.isNaN(+d) || d > new Date()) {
        e.dateOfBirth =
          t("error.futureDate") || "Ungültiges Geburtsdatum.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---- Speichern
  const onSave = async () => {
    if (!currentUser) return;
    if (!validate()) return;
    try {
      const update = {
        displayName:
          form.displayName?.trim() ||
          [form.firstName, form.lastName].filter(Boolean).join(" ").trim(),
        firstName: form.firstName || "",
        lastName: form.lastName || "",
        phoneNumber: form.phoneNumber || "",
        dateOfBirth: form.dateOfBirth || "",
        location: form.location || "",
        bio: form.bio || "",
        role: form.role || "user",
        photoURL: form.photoURL || "",
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", currentUser.uid), update, { merge: true });
      try {
        await updateProfile(currentUser, {
          displayName: update.displayName || null,
          photoURL: update.photoURL || null,
        });
      } catch (e) {
        console.warn("[auth] updateProfile failed:", e);
      }
      await load();
      toast.success(
        t("toast.saved") || "Änderungen erfolgreich gespeichert."
      );
    } catch (e) {
      console.error("[Profile] save error:", e);
      toast.error(
        t("error.saveFailed") || "Speichern fehlgeschlagen."
      );
    }
  };

  // ---- UI States
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        {t("loading") || "Profil wird geladen…"}
      </div>
    );
  }
  if (fetchError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-100 text-red-700 px-5 py-3 rounded">
          {fetchError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16 md:pt-0">
      {/* Sticky Save-Bar */}
      <div
        className={`sticky top-16 md:top-0 z-40 transition-transform ${
          dirty ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-medium">
              {t("title") || "Mein Profil"}
              {dirty && (
                <span className="ml-2 text-sm text-gray-500">
                  • {t("unsavedChanges") || "Nicht gespeicherte Änderungen"}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setForm(userData)}
                className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600"
              >
                {t("cancel") || "Abbrechen"}
              </button>
              <button
                onClick={onSave}
                disabled={!dirty}
                className={`px-4 py-1.5 rounded-full text-white ${
                  dirty
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-400 cursor-not-allowed"
                }`}
              >
                {t("saveChanges") || "Speichern"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 flex gap-6">
        <AccountSidebar />

        <div className="flex-1 space-y-8">
          {/* Header + Avatar */}
          <header className="bg-transparent">
            <div className="px-0 md:px-2 py-2 md:py-4 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {t("title") || "Mein Profil"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {t("description")}
                </p>
              </div>

              <AvatarUploader
                uid={currentUser.uid}
                value={form.photoURL}
                onChange={(url) => setForm((s) => ({ ...s, photoURL: url }))}
              />
            </div>

            {/* Info-Banner zu Kontaktanfragen */}
            <div className="mt-2 md:mt-3">
              <div className="flex flex-wrap items-center gap-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-3 text-sm">
                <p className="text-gray-700 dark:text-gray-200 flex-1 min-w-[220px]">
                  {t("banner.text")}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/profile?tab=messages")}
                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs md:text-sm"
                >
                  {t("banner.button")}
                </button>
              </div>
            </div>
          </header>

          {/* Tabs-Inhalt */}
          {tab === "profile" && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow">
              <h2 className="text-xl font-semibold mb-5 text-blue-600 dark:text-blue-400">
                {t("userInfo") || "Benutzerdaten"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("firstName") || "Vorname"}
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName || ""}
                    onChange={onChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("lastName") || "Nachname"}
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName || ""}
                    onChange={onChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("name") || "Anzeigename"}
                  </label>
                  <input
                    name="displayName"
                    value={form.displayName || ""}
                    onChange={onChange}
                    className={`w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 ${
                      errors.displayName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("email") || "E-Mail"}
                  </label>
                  <input
                    disabled
                    value={form.email || ""}
                    className="w-full p-3 rounded-xl border border-gray-300 bg-gray-100 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("phone") || "Telefon"}
                  </label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber || ""}
                    onChange={onChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("dateOfBirth") || "Geburtsdatum"}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth || ""}
                    onChange={onChange}
                    className={`w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 ${
                      errors.dateOfBirth ? "border-red-500" : ""
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("location") || "Ort"}
                  </label>
                  <input
                    name="location"
                    value={form.location || ""}
                    onChange={onChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("bio") || "Über mich"}
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={form.bio || ""}
                    onChange={onChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                    {t("role") || "Rolle"}
                  </label>
                  <select
                    name="role"
                    value={form.role || "user"}
                    onChange={onChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
                  >
                    <option value="user">
                      {t("user") || "Benutzer:in"}
                    </option>
                    <option value="owner">
                      {t("owner") || "Eigentümer:in"}
                    </option>
                    <option value="agent">
                      {t("agent") || "Makler:in"}
                    </option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {tab === "account" && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow">
              <h2 className="text-xl font-semibold mb-3">
                {t("account.title")}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                {t("account.subtitle")}
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• {t("account.hintEmail")}</li>
                <li>• {t("account.hintPassword")}</li>
              </ul>
            </section>
          )}

          {tab === "messages" && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow">
              <h2 className="text-xl font-semibold mb-5">
                {t("messages.title")}
              </h2>

              {messagesLoading && (
                <p className="text-sm text-gray-500">
                  {t("messages.loading")}
                </p>
              )}

              {!messagesLoading && contactRequests.length === 0 && (
                <p className="text-sm text-gray-500">
                  {t("messages.empty")}
                </p>
              )}

              {!messagesLoading && contactRequests.length > 0 && (
                <div className="space-y-3">
                  {contactRequests.map((m) => (
                    <article
                      key={m.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40"
                    >
                      <div className="flex flex-wrap justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-semibold">
                            {t("messages.from")} {m.name || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("messages.onListing")}{" "}
                            {m.listingTitle || m.listingId || "-"}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("messages.sentAt")}{" "}
                          {m.sentAt?.toDate
                            ? m.sentAt
                                .toDate()
                                .toLocaleString("de-DE")
                            : "—"}
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 space-y-1">
                        {m.email && (
                          <p>
                            <span className="font-medium">
                              {t("messages.email")}:
                            </span>{" "}
                            {m.email}
                          </p>
                        )}
                        {m.phone && (
                          <p>
                            <span className="font-medium">
                              {t("messages.phone")}:
                            </span>{" "}
                            {m.phone}
                          </p>
                        )}
                      </div>

                      {m.message && (
                        <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line">
                          {m.message}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Stats */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow">
            <h2 className="text-xl font-semibold mb-5 text-green-600 dark:text-green-400">
              {t("stats.title")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label={t("stats.totalListings")}
                value={stats.total}
                color="blue"
              />
              <StatCard
                label={t("stats.published")}
                value={stats.published}
                color="green"
              />
              <StatCard
                label={t("stats.pending")}
                value={stats.pending}
                color="yellow"
              />
              <StatCard
                label={t("stats.rejected")}
                value={stats.rejected}
                color="red"
              />
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Save (mobile) */}
      <div
        className={`fixed md:hidden bottom-4 inset-x-0 px-4 z-40 ${
          dirty ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-3 flex gap-2">
          <button
            onClick={() => setForm(userData)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600"
          >
            {t("cancel") || "Abbrechen"}
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("saveChanges") || "Speichern"}
          </button>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        theme="light"
      />
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30",
    green:
      "text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30",
    yellow:
      "text-yellow-600 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30",
    red: "text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30",
  };
  return (
    <div className={`p-6 rounded-xl text-center ${colorMap[color] || ""}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1">{label}</div>
    </div>
  );
}
