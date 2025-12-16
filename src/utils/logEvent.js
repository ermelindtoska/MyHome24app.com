// src/utils/logEvent.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

/**
 * Zentraler Logger für wichtige Events.
 *
 * Beispiel:
 *  await logEvent({
 *    type: "offer.accepted",
 *    message: "Angebot wurde angenommen",
 *    listingId: "...",
 *    offerId: "...",
 *  });
 */
export async function logEvent(payload) {
  try {
    const currentUserId = auth.currentUser?.uid || null;

    const data = {
      type: payload.type || "unknown",
      message: payload.message || "",
      userId: payload.userId || currentUserId,
      // optionaler Kontext (listingId, offerId, role, etc.)
      listingId: payload.listingId || null,
      offerId: payload.offerId || null,
      ownerId: payload.ownerId || null,
      buyerId: payload.buyerId || null,
      extra: payload.extra || null,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, "logs"), data);
  } catch (error) {
    console.error("[logEvent] Fehler beim Schreiben des Logs:", error);
  }
}
