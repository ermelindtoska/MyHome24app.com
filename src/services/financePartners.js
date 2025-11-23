// src/services/financePartners.js
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const saveFinancePartner = async (userId, data) => {
  await setDoc(doc(db, "financePartners", userId), {
    userId,
    ...data,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
