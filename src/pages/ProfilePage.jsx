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
import {
  FaRegUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaIdBadge,
  FaSave,
  FaTimes,
  FaInbox,
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaLayerGroup,
} from "react-icons/fa";

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

  const [contactRequests, setContactRequests] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
        {t("loading") || "Profil wird geladen…"}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {fetchError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:pt-0">
      <div
        className={`sticky top-16 z-40 transition-transform md:top-0 ${
          dirty ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 dark:text-slate-50">
                {t("title") || "Mein Profil"}
              </div>
              {dirty && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {t("unsavedChanges") || "Nicht gespeicherte Änderungen"}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setForm(userData)}
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FaTimes className="mr-2" />
                {t("cancel") || "Abbrechen"}
              </button>

              <button
                onClick={onSave}
                disabled={!dirty}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                  dirty
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-blue-400"
                }`}
              >
                <FaSave className="mr-2" />
                {t("saveChanges") || "Speichern"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
        <AccountSidebar />

        <div className="flex-1 space-y-8">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-500/10 p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
                    <FaRegUser className="mr-2 text-[10px]" />
                    {t("title") || "Mein Profil"}
                  </div>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                    {t("title") || "Mein Profil"}
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                    {t("description")}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/50">
                    <AvatarUploader
                      uid={currentUser.uid}
                      value={form.photoURL}
                      onChange={(url) =>
                        setForm((s) => ({ ...s, photoURL: url }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-800 dark:bg-blue-900/30">
                  <p className="min-w-[220px] flex-1 text-slate-700 dark:text-slate-200">
                    {t("banner.text")}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/profile?tab=messages")}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700 md:text-sm"
                  >
                    <FaInbox className="mr-2" />
                    {t("banner.button")}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {tab === "profile" && (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {t("userInfo") || "Benutzerdaten"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field
                  icon={<FaRegUser />}
                  label={t("firstName") || "Vorname"}
                  error={null}
                >
                  <input
                    name="firstName"
                    value={form.firstName || ""}
                    onChange={onChange}
                    className="input-profile"
                  />
                </Field>

                <Field
                  icon={<FaRegUser />}
                  label={t("lastName") || "Nachname"}
                  error={null}
                >
                  <input
                    name="lastName"
                    value={form.lastName || ""}
                    onChange={onChange}
                    className="input-profile"
                  />
                </Field>

                <Field
                  icon={<FaIdBadge />}
                  label={t("name") || "Anzeigename"}
                  error={errors.displayName}
                  full
                >
                  <input
                    name="displayName"
                    value={form.displayName || ""}
                    onChange={onChange}
                    className={`input-profile ${
                      errors.displayName ? "border-red-500" : ""
                    }`}
                  />
                </Field>

                <Field
                  icon={<FaEnvelope />}
                  label={t("email") || "E-Mail"}
                  error={null}
                >
                  <input
                    disabled
                    value={form.email || ""}
                    className="input-profile cursor-not-allowed bg-slate-100 dark:bg-slate-800/80"
                  />
                </Field>

                <Field
                  icon={<FaPhone />}
                  label={t("phone") || "Telefon"}
                  error={null}
                >
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber || ""}
                    onChange={onChange}
                    className="input-profile"
                  />
                </Field>

                <Field
                  icon={<FaBirthdayCake />}
                  label={t("dateOfBirth") || "Geburtsdatum"}
                  error={errors.dateOfBirth}
                >
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth || ""}
                    onChange={onChange}
                    className={`input-profile ${
                      errors.dateOfBirth ? "border-red-500" : ""
                    }`}
                  />
                </Field>

                <Field
                  icon={<FaMapMarkerAlt />}
                  label={t("location") || "Ort"}
                  error={null}
                >
                  <input
                    name="location"
                    value={form.location || ""}
                    onChange={onChange}
                    className="input-profile"
                  />
                </Field>

                <Field
                  icon={<FaRegUser />}
                  label={t("bio") || "Über mich"}
                  error={null}
                  full
                >
                  <textarea
                    name="bio"
                    rows={5}
                    value={form.bio || ""}
                    onChange={onChange}
                    className="input-profile resize-none"
                  />
                </Field>

                <Field
                  icon={<FaIdBadge />}
                  label={t("role") || "Rolle"}
                  error={null}
                  full
                >
                  <select
                    name="role"
                    value={form.role || "user"}
                    onChange={onChange}
                    className="input-profile"
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
                </Field>
              </div>
            </section>
          )}

          {tab === "account" && (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {t("account.title")}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t("account.subtitle")}
              </p>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    • {t("account.hintEmail")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    • {t("account.hintPassword")}
                  </p>
                </div>
              </div>
            </section>
          )}

          {tab === "messages" && (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {t("messages.title")}
                </h2>
              </div>

              {messagesLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("messages.loading")}
                </p>
              )}

              {!messagesLoading && contactRequests.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("messages.empty")}
                </p>
              )}

              {!messagesLoading && contactRequests.length > 0 && (
                <div className="space-y-4">
                  {contactRequests.map((m) => (
                    <article
                      key={m.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
                    >
                      <div className="mb-3 flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {t("messages.from")} {m.name || "-"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t("messages.onListing")}{" "}
                            {m.listingTitle || m.listingId || "-"}
                          </p>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t("messages.sentAt")}{" "}
                          {m.sentAt?.toDate
                            ? m.sentAt.toDate().toLocaleString("de-DE")
                            : "—"}
                        </div>
                      </div>

                      <div className="mb-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
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
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                          {m.message}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FaChartBar />
              </div>
              <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                {t("stats.title")}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                label={t("stats.totalListings")}
                value={stats.total}
                color="blue"
                icon={<FaLayerGroup />}
              />
              <StatCard
                label={t("stats.published")}
                value={stats.published}
                color="green"
                icon={<FaCheckCircle />}
              />
              <StatCard
                label={t("stats.pending")}
                value={stats.pending}
                color="yellow"
                icon={<FaClock />}
              />
              <StatCard
                label={t("stats.rejected")}
                value={stats.rejected}
                color="red"
                icon={<FaTimesCircle />}
              />
            </div>
          </section>
        </div>
      </main>

      <div
        className={`fixed inset-x-0 bottom-4 z-40 px-4 md:hidden ${
          dirty ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setForm(userData)}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            {t("cancel") || "Abbrechen"}
          </button>
          <button
            onClick={onSave}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
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

      <style>{`
        .input-profile {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 1rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          color: rgb(15 23 42);
          outline: none;
          transition: all 0.2s ease;
        }
        .input-profile:focus {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .dark .input-profile {
          background: rgb(55 65 81);
          border-color: rgb(71 85 105);
          color: rgb(248 250 252);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, error, full = false, icon = null }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green:
      "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    yellow:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 p-5 text-center shadow-sm dark:border-slate-800 ${colorMap[color] || ""}`}
    >
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-lg shadow-sm dark:bg-slate-950/30">
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm">{label}</div>
    </div>
  );
}