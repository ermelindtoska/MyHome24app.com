// src/publish/PublishProperty.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import {
  addDoc,
  collection,
  GeoPoint,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { toast } from "sonner";

const STEP = { INFO: 0, LOCATION: 1, PHOTOS: 2, REVIEW: 3 };

const initialState = {
  purpose: "buy",
  type: "apartment",
  title: "",
  description: "",
  price: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
  yearBuilt: "",
  amenities: {
    balcony: false,
    parking: false,
    garden: false,
    elevator: false,
  },

  address: "",
  zipCode: "",
  city: "",
  lat: null,
  lng: null,

  images: [], // File-Objekte
  imagePreviews: [], // ObjectURLs für Vorschau
};

export default function PublishProperty() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [step, setStep] = useState(STEP.INFO);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialState);

  const setField = (name, value) =>
    setForm((s) => ({
      ...s,
      [name]: value,
    }));

  const setAmenity = (name) =>
    setForm((s) => ({
      ...s,
      amenities: { ...s.amenities, [name]: !s.amenities[name] },
    }));

  const canContinueInfo = useMemo(() => {
    return (
      form.title.trim().length >= 6 &&
      form.description.trim().length >= 20 &&
      Number(form.price) > 0 &&
      form.type &&
      form.purpose
    );
  }, [form]);

  const canContinueLocation = useMemo(() => {
    return (
      form.address.trim().length >= 3 &&
      form.city.trim().length >= 2 &&
      form.zipCode.trim().length >= 3
    );
  }, [form]);

  // ---------------------------------------------------------------------------
  // Geocoding mit Mapbox
  // ---------------------------------------------------------------------------
  const geocodeOnce = async () => {
    const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

    if (!MAPBOX_TOKEN) {
      toast.warning("Kein Mapbox-Token für Geocoding konfiguriert.");
      return null;
    }

    try {
      const q = `${form.address}, ${form.zipCode} ${form.city}, Deutschland`;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        q
      )}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=DE`;

      const resp = await fetch(url);
      if (!resp.ok) {
        console.warn(
          "[Geocode] Mapbox HTTP-Fehler:",
          resp.status,
          resp.statusText
        );
        toast.warning(
          "Adresse konnte nicht automatisch verortet werden (Server-Antwort)."
        );
        return null;
      }

      const data = await resp.json();
      if (
        data &&
        Array.isArray(data.features) &&
        data.features.length > 0 &&
        Array.isArray(data.features[0].center)
      ) {
        const [lng, lat] = data.features[0].center;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setForm((s) => ({ ...s, lat, lng }));
          toast.success("Adresse erfolgreich verortet.");
          return { lat, lng };
        }
      }

      toast.warning(
        "Adresse konnte nicht automatisch verortet werden (kein Ergebnis)."
      );
      return null;
    } catch (err) {
      console.error("[Geocode] Mapbox Fehler:", err);
      toast.warning(
        "Adresse konnte nicht automatisch verortet werden (Netzwerkfehler)."
      );
      return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Bilder auswählen / löschen (nur im State)
  // ---------------------------------------------------------------------------
  const handleImages = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    const previews = list.map((f) => URL.createObjectURL(f));
    setForm((s) => ({
      ...s,
      images: [...s.images, ...list],
      imagePreviews: [...s.imagePreviews, ...previews],
    }));
  };

  const removeImage = (idx) => {
    setForm((s) => {
      const imgs = [...s.images];
      const prevs = [...s.imagePreviews];
      if (prevs[idx]) URL.revokeObjectURL(prevs[idx]);
      imgs.splice(idx, 1);
      prevs.splice(idx, 1);
      return { ...s, images: imgs, imagePreviews: prevs };
    });
  };

  // ---------------------------------------------------------------------------
  // Bilder in Storage hochladen → URLs zurückgeben
  // Pfad: listingPhotos/{uid}/{listingId}/{file}
  // ---------------------------------------------------------------------------
  const uploadPhotos = async (listingId) => {
    if (!form.images.length) return [];

    if (!currentUser?.uid) {
      toast.error("Du musst angemeldet sein, um Fotos hochzuladen.");
      return [];
    }

    const urls = [];

    for (const file of form.images) {
      try {
        const path = `listingPhotos/${currentUser.uid}/${listingId}/${Date.now()}-${
          file.name
        }`;
        const r = storageRef(storage, path);
        await uploadBytes(r, file);
        const url = await getDownloadURL(r);
        urls.push(url);
      } catch (err) {
        console.error("[Upload] Fehler beim Bild-Upload:", err);
        toast.error(
          "Ein Foto konnte nicht hochgeladen werden: " +
            (err?.message || "")
        );
      }
    }

    return urls;
  };

  // ---------------------------------------------------------------------------
  // Listing speichern + Bilder verknüpfen
  // ---------------------------------------------------------------------------
  const handlePublish = async () => {
    if (!currentUser?.uid) {
      toast.error("Du musst angemeldet sein.");
      return;
    }
    if (!canContinueInfo || !canContinueLocation) {
      toast.error("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    setSaving(true);
    try {
      // 1. ggf. Geocoding nachholen
      if (!(Number.isFinite(form.lat) && Number.isFinite(form.lng))) {
        await geocodeOnce();
      }

      const lat =
        form.lat != null && form.lat !== "" ? Number(form.lat) : null;
      const lng =
        form.lng != null && form.lng !== "" ? Number(form.lng) : null;

      // 2. Basis-Dokument in Firestore anlegen (ohne Bilder)
      const payload = {
        userId: currentUser.uid,
        ownerId: currentUser.uid,

        purpose: (form.purpose || "").toLowerCase().trim(),
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),

        price: Number(form.price) || 0,
        rooms: Number(form.rooms) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        size: Number(form.size) || 0,
        yearBuilt: Number(form.yearBuilt) || null,

        amenities: form.amenities,

        address: form.address.trim(),
        city: form.city.trim(),
        zipCode: form.zipCode.trim(),

        lat,
        lng,
        geopt:
          lat !== null && lng !== null ? new GeoPoint(lat, lng) : null,

        searchIndex: [
          form.city?.toLowerCase() || "",
          form.zipCode || "",
          form.address?.toLowerCase() || "",
          form.type || "",
          (form.purpose || "").toLowerCase() || "",
        ].filter(Boolean),

        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // werden gleich nach dem Upload gefüllt
        images: [],
        imageUrls: [],
      };

      const docRef = await addDoc(collection(db, "listings"), payload);

      // 3. Bilder hochladen
      const urls = await uploadPhotos(docRef.id);

      // 4. URLs ins Listing schreiben (images + imageUrls)
      if (urls.length) {
        await setDoc(
          doc(db, "listings", docRef.id),
          {
            images: urls,
            imageUrls: urls,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      toast.success("Immobilie erfolgreich veröffentlicht!");

      // 👉 Nach Veröffentlichung direkt zur Detailseite
      navigate(`/listing/${docRef.id}`, { replace: true });
    } catch (e) {
      console.error("[PublishProperty] Fehler beim Speichern:", e);
      toast.error("Speichern fehlgeschlagen: " + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-2">
          Immobilie veröffentlichen
        </h1>
        <p className="text-gray-600">
          Bitte melde dich zuerst an, um Inserate zu erstellen.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">
          Immobilie veröffentlichen
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Fülle die Informationen aus, lade Fotos hoch und veröffentliche
          dein Inserat.
        </p>

        <Stepper step={step} />

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-5">
          {step === STEP.INFO && (
            <InfoStep
              form={form}
              setField={setField}
              setAmenity={setAmenity}
            />
          )}
          {step === STEP.LOCATION && (
            <LocationStep
              form={form}
              setField={setField}
              geocode={geocodeOnce}
            />
          )}
          {step === STEP.PHOTOS && (
            <PhotosStep
              form={form}
              handleImages={handleImages}
              removeImage={removeImage}
            />
          )}
          {step === STEP.REVIEW && <ReviewStep form={form} />}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(STEP.INFO, s - 1))}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm"
            disabled={step === STEP.INFO || saving}
          >
            Zurück
          </button>

          {step < STEP.REVIEW ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
              disabled={
                saving ||
                (step === STEP.INFO && !canContinueInfo) ||
                (step === STEP.LOCATION && !canContinueLocation)
              }
            >
              Weiter
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="px-5 py-2 rounded bg-emerald-600 text-white text-sm disabled:opacity-50"
            >
              {saving ? "Wird veröffentlicht…" : "Jetzt veröffentlichen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hilfs-Komponenten (Stepper, Steps)
// ---------------------------------------------------------------------------
function Stepper({ step }) {
  const labels = ["Infos", "Standort", "Fotos", "Prüfen"];
  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      {labels.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= idx
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {idx + 1}
          </div>
          <span className="ml-2 mr-4 text-gray-800 dark:text-gray-200">
            {label}
          </span>
          {idx < labels.length - 1 && (
            <div className="w-8 h-[2px] bg-gray-400 opacity-50" />
          )}
        </div>
      ))}
    </div>
  );
}

function InfoStep({ form, setField, setAmenity }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Zweck</label>
        <select
          value={form.purpose}
          onChange={(e) => setField("purpose", e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="buy">Kaufen</option>
          <option value="rent">Mieten</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Typ</label>
        <select
          value={form.type}
          onChange={(e) => setField("type", e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="apartment">Wohnung</option>
          <option value="house">Haus</option>
          <option value="commercial">Büro / Gewerbe</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Titel</label>
        <input
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Helle 3-Zimmer-Wohnung im Zentrum"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">
          Beschreibung
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={5}
          className="w-full border rounded px-3 py-2"
          placeholder="Beschreibe die Immobilie ausführlich…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {form.purpose === "rent" ? "Miete (€/Monat)" : "Preis (€)"}
        </label>
        <input
          type="number"
          min="0"
          value={form.price}
          onChange={(e) => setField("price", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Wohnfläche (m²)
        </label>
        <input
          type="number"
          min="0"
          value={form.size}
          onChange={(e) => setField("size", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Zimmer</label>
        <input
          type="number"
          min="0"
          value={form.rooms}
          onChange={(e) => setField("rooms", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Schlafzimmer
        </label>
        <input
          type="number"
          min="0"
          value={form.bedrooms}
          onChange={(e) => setField("bedrooms", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Badezimmer
        </label>
        <input
          type="number"
          min="0"
          value={form.bathrooms}
          onChange={(e) => setField("bathrooms", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Baujahr</label>
        <input
          type="number"
          min="1800"
          value={form.yearBuilt}
          onChange={(e) => setField("yearBuilt", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="md:col-span-2">
        <span className="block text-sm font-medium mb-1">
          Ausstattung
        </span>
        <div className="flex flex-wrap gap-4">
          {[
            ["balcony", "Balkon"],
            ["parking", "Parkplatz"],
            ["garden", "Garten"],
            ["elevator", "Aufzug"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="inline-flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={!!form.amenities[key]}
                onChange={() => setAmenity(key)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function LocationStep({ form, setField, geocode }) {
  const handleGeocodeClick = async () => {
    try {
      await geocode();
    } catch (err) {
      console.error("[LocationStep] geocode error:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">
          Adresse
        </label>
        <input
          value={form.address}
          onChange={(e) => setField("address", e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Straße und Hausnummer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">PLZ</label>
        <input
          value={form.zipCode}
          onChange={(e) => setField("zipCode", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Stadt
        </label>
        <input
          value={form.city}
          onChange={(e) => setField("city", e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleGeocodeClick}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
        >
          Adresse verorten
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {Number.isFinite(form.lat) && Number.isFinite(form.lng)
            ? `Koordinaten: ${Number(form.lat).toFixed(
                6
              )}, ${Number(form.lng).toFixed(6)}`
            : "Noch keine Koordinaten"}
        </span>
      </div>
    </div>
  );
}

function PhotosStep({ form, handleImages, removeImage }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Fotos (max. 10)
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleImages(e.target.files)}
      />
      {form.imagePreviews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {form.imagePreviews.map((src, idx) => (
            <div key={idx} className="relative group">
              <img
                src={src}
                alt={`foto-${idx}`}
                className="w-full h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
              >
                Entfernen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewStep({ form }) {
  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">
        {form.title || "—"}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {form.description || "—"}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <strong>Zweck:</strong> {form.purpose}
        </div>
        <div>
          <strong>Typ:</strong> {form.type}
        </div>
        <div>
          <strong>Preis:</strong> {form.price || "—"} €
        </div>
        <div>
          <strong>Fläche:</strong> {form.size || "—"} m²
        </div>
        <div>
          <strong>Zimmer:</strong> {form.rooms || "—"}
        </div>
        <div>
          <strong>Schlafzimmer:</strong> {form.bedrooms || "—"}
        </div>
        <div>
          <strong>Badezimmer:</strong> {form.bathrooms || "—"}
        </div>
        <div>
          <strong>Baujahr:</strong> {form.yearBuilt || "—"}
        </div>
      </div>
      <div className="text-sm">
        <strong>Adresse:</strong> {form.address}, {form.zipCode}{" "}
        {form.city}
      </div>

      {form.imagePreviews.length > 0 && (
        <>
          <div className="text-sm font-medium">Fotos:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {form.imagePreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt=""
                className="w-full h-28 object-cover rounded border"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
