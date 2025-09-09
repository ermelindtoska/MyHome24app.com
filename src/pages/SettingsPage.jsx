// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { updateProfile, reload } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ndihmës: normalizon datën në formatin e fushës <input type="date">
function normalizeDateToInput(v) {
  if (!v) return "";
  if (typeof v === "string") {
    // lejo formatet "YYYY-MM-DD" ose ISO
    const d = new Date(v);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return v; // lëre siç është nëse është tashmë "YYYY-MM-DD"
  }
  if (v?.toDate) return v.toDate().toISOString().slice(0, 10); // Firestore Timestamp
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return "";
}

export default function SettingsPage() {
  const { t } = useTranslation("settings");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const REDIRECT_AFTER_SAVE = "/"; // ndrysho në "/dashboard" nëse e do atje

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    profilePicture: "",
  });

  // lexon të dhënat e përdoruesit
  useEffect(() => {
    (async () => {
      if (!currentUser) return;

      // fillo me atë që vjen nga Auth
      setUserData((s) => ({
        ...s,
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        profilePicture: currentUser.photoURL || "",
      }));

      // shto/mbulo me ato që kemi në Firestore
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData((s) => ({
            ...s,
            phoneNumber: data.phoneNumber || s.phoneNumber || "",
            dateOfBirth: normalizeDateToInput(data.dateOfBirth) || "",
            // nëse ke ruajtur edhe displayName/profilePicture në doc:
            displayName: data.displayName ?? s.displayName,
            profilePicture: data.profilePicture ?? s.profilePicture,
          }));
        }
      } catch (e) {
        console.error("Error reading user doc:", e);
      }
    })();
  }, [currentUser]);

  const handleChange = (e) =>
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      // 1) përditëso Auth (emër + foto)
      await updateProfile(currentUser, {
        displayName: userData.displayName || null,
        photoURL: userData.profilePicture || null,
      });

      // 2) përditëso Firestore (doc krijohet nëse mungon)
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          email: currentUser.email,
          displayName: userData.displayName || null,
          phoneNumber: userData.phoneNumber || null,
          dateOfBirth: userData.dateOfBirth || null,
          profilePicture: userData.profilePicture || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 3) rifresko instancën në memorie që Navbar të marrë menjëherë emrin/foton e re
      try {
        await reload(currentUser);
      } catch (_) {}

      toast.success(t("profileUpdated") || "Profil erfolgreich aktualisiert!");
      setTimeout(() => navigate(REDIRECT_AFTER_SAVE), 700);
    } catch (err) {
      console.error("Settings update error:", err);
      toast.error(t("updateFailed") || "Fehler beim Aktualisieren des Profils.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div className="p-6">{t("loginRequired")}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t("title") || "Einstellungen"}</h1>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("name") || "Name"}</label>
          <input
            type="text"
            name="displayName"
            value={userData.displayName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-Mail</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("phone") || "Telefon"}</label>
          <input
            type="tel"
            name="phoneNumber"
            value={userData.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("dateOfBirth") || "Geburtsdatum"}</label>
          <input
            type="date"
            name="dateOfBirth"
            value={normalizeDateToInput(userData.dateOfBirth)}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("profilePicture") || "Profilbild URL"}
          </label>
          <input
            type="url"
            name="profilePicture"
            value={userData.profilePicture}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder={t("profilePictureUrl") || "https://..."}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t("saving") || "Speichern…" : t("saveChanges") || "Änderungen speichern"}
        </button>
      </form>
    </div>
  );
}
