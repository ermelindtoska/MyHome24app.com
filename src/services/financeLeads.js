// src/services/financeLeads.js
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const saveFinanceLead = async (data) => {
  await addDoc(collection(db, "financeLeads"), {
    ...data,
    status: "open",
    source: "mortgageCalculator",
    createdAt: serverTimestamp(),
  });
};
