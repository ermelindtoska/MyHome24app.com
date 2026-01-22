// src/services/financePartnerService.js
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Lexon profilin e partnerit për një userId.
 * Kthen null nëse nuk ekziston.
 */
export async function getFinancePartnerProfile(userId) {
  if (!userId) return null;
  const ref = doc(db, "financePartners", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Krijon ose përditëson profilin e partnerit në koleksionin financePartners.
 * docId = userId
 */
export async function saveFinancePartnerProfile(userId, data) {
  if (!userId) throw new Error("saveFinancePartnerProfile: userId fehlt");

  const ref = doc(db, "financePartners", userId);

  const payload = {
    userId,
    companyName: data.companyName || "",
    contactEmail: data.contactEmail || "",
    contactPhone: data.contactPhone || "",
    partnerType: data.partnerType || "bank",
    regions: Array.isArray(data.regions) ? data.regions : [],
    products: Array.isArray(data.products) ? data.products : [],
    websiteUrl: data.websiteUrl || "",
    isActive: data.isActive ?? true,
    updatedAt: serverTimestamp(),
  };

  // nëse dokumenti nuk ekziston, vendosim edhe createdAt
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(ref, payload, { merge: true });
  return payload;
}

/**
 * Krijon një lead të ri nga kalkulatori i hipotekës.
 * assignedPartnerId mund të jetë null (admin/algoritmi e cakton më vonë).
 */
export async function createFinanceLeadFromCalculator({
  userId = null,
  purchasePrice,
  downPayment,
  interest,
  termYears,
  city = "",
  postalCode = "",
  note = "",
  assignedPartnerId = null,
}) {
  const ref = collection(db, "financeLeads");

  const docData = {
    userId: userId || null,
    source: "mortgageCalculator",
    status: "open",
    purchasePrice: Number(purchasePrice) || 0,
    downPayment: Number(downPayment) || 0,
    interest: Number(interest) || 0,
    termYears: Number(termYears) || 0,
    city,
    postalCode,
    note,
    assignedPartnerId: assignedPartnerId || null,
    createdAt: serverTimestamp(),
  };

  const snap = await addDoc(ref, docData);
  return { id: snap.id, ...docData };
}
