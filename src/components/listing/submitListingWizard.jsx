import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage, auth } from "../../firebase";

function sanitizeFileName(name = "image") {
  return String(name)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

async function uploadPhotos(listingId, photos = []) {
  const uploadedUrls = [];

  for (let i = 0; i < photos.length; i += 1) {
    const item = photos[i];

    try {
      if (typeof item === "string" && item.trim()) {
        uploadedUrls.push(item.trim());
        continue;
      }

      if (item?.file) {
        const safeName = sanitizeFileName(item.file.name || `photo-${i + 1}.jpg`);
        const path = `listings/${listingId}/${Date.now()}-${i + 1}-${safeName}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, item.file, {
          contentType: item.file.type || "image/jpeg",
        });

        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
        continue;
      }

      if (
        item?.preview &&
        typeof item.preview === "string" &&
        item.preview.startsWith("http")
      ) {
        uploadedUrls.push(item.preview);
      }
    } catch (err) {
      console.error(`[submitListingWizard] Foto ${i + 1} konnte nicht hochgeladen werden:`, err);
    }
  }

  return uploadedUrls;
}

export async function submitListingWizard(data) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const draftId = `listing-${Date.now()}-${user.uid}`;
  const imageUrls = await uploadPhotos(draftId, data.photos || []);

  const listingPayload = {
    userId: user.uid,
    ownerId: user.uid,
    ownerEmail: user.email || "",
    ownerName: user.displayName || "",

    title: data.title || "",
    description: data.description || "",

    purpose: data.purpose || "buy",
    type: data.type || "house",

    price: Number(data.price) || 0,
    rooms: Number(data.rooms) || 0,
    bedrooms: Number(data.bedrooms) || 0,
    bathrooms: Number(data.bathrooms) || 0,
    size: Number(data.livingArea) || 0,
    livingArea: Number(data.livingArea) || 0,
    yearBuilt: Number(data.yearBuilt) || 0,

    address: data.address || "",
    postalCode: data.postalCode || "",
    zip: data.postalCode || "",
    city: data.city || "",
    state: data.state || "",
    country: data.country || "Deutschland",
    latitude:
      data.latitude !== "" &&
      data.latitude !== null &&
      data.latitude !== undefined
        ? Number(data.latitude)
        : null,
    longitude:
      data.longitude !== "" &&
      data.longitude !== null &&
      data.longitude !== undefined
        ? Number(data.longitude)
        : null,
    locationNote: data.locationNote || "",

    images: imageUrls,
    imageUrls,
    imageUrl: imageUrls[0] || "",
    coverImage: imageUrls[0] || "",

    status: "active",
    verified: false,
    source: "listingWizard",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "listings"), listingPayload);

  return {
    id: docRef.id,
    imageUrls,
  };
}