// src/services/saveListingWithImages.js
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

/**
 * Ruaj listimin + ngarko fotot në Storage
 *
 * @param {object} payload  - të dhënat e listing-ut (pa imazhe)
 * @param {File[]} files    - lista e fotove nga form (form.images)
 * @param {string} userId   - currentUser.uid
 * @returns {Promise<{ id: string, imageUrls: string[] }>}
 */
export async function saveListingWithImages(payload, files = [], userId) {
  if (!userId) {
    throw new Error("Kein gültiger Benutzer (userId fehlt).");
  }

  // 1. përgatis dokumentin bazë për Firestore
  const baseDoc = {
    ...payload,
    userId,
    ownerId: userId,
    status: payload.status || "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    images: [],
    imageUrls: [],
  };

  // nëse kemi lat/lng, krijo GeoPoint
  if (
    typeof payload.lat === "number" &&
    Number.isFinite(payload.lat) &&
    typeof payload.lng === "number" &&
    Number.isFinite(payload.lng)
  ) {
    baseDoc.geopt = new GeoPoint(payload.lat, payload.lng);
  } else {
    baseDoc.geopt = null;
  }

  // 2. krijo dokumentin në koleksionin "listings"
  const docRef = await addDoc(collection(db, "listings"), baseDoc);
  const listingId = docRef.id;

  // 3. nëse nuk ka file, kthehu direkt
  if (!files || !files.length) {
    return { id: listingId, imageUrls: [] };
  }

  const imageUrls = [];

  // 4. ngarko çdo foto në Storage sipas rregullit:
  //    listingPhotos/{uid}/{listingId}/{timestamp}-{filename}
  for (const file of files) {
    try {
      const path = `listingPhotos/${userId}/${listingId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    } catch (err) {
      console.error("[saveListingWithImages] Fehler beim Bild-Upload:", err);
      // vazhdo me foton tjetër – nuk e prish gjithë listimin
    }
  }

  // 5. ruaj URL-t e fotove në dokumentin e listimit
  if (imageUrls.length) {
    await setDoc(
      doc(db, "listings", listingId),
      {
        images: imageUrls,
        imageUrls,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return { id: listingId, imageUrls };
}
