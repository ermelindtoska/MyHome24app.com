// src/roles/changeRole.js
import { auth, db } from "../firebase";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Ndryshon rolin në vend (nëse je admin) ose bën kërkesë për upgrade (nëse je user).
 * @param {"user"|"owner"|"agent"} targetRole
 * @returns {Promise<{ok:boolean, requested?:boolean, msg:string}>}
 */
export async function requestOrChangeRole(targetRole) {
  const user = auth.currentUser;
  if (!user) return { ok: false, msg: "Nuk je i loguar." };

  // a je admin?
  const token = await user.getIdTokenResult();
  const isAdmin = !!token.claims?.admin;

  if (isAdmin) {
    await updateDoc(doc(db, "users", user.uid), { role: targetRole });
    return { ok: true, msg: "Roli u përditësua." };
  }

  // përdorues i thjeshtë → bën kërkesë
  if (targetRole === "user") {
    // mund të kthesh mesazh që downgrades i bën vetëm admin:
    return { ok: false, msg: "Vetëm admin-i mund të ndryshojë rolin direkt." };
  }

  await setDoc(
    doc(db, "roleUpgradeRequests", user.uid),
    {
      userId: user.uid,
      email: user.email || "",
      fullName: user.displayName || "",
      targetRole,         // p.sh. "owner" ose "agent"
      reason: "Self-service request from role menu",
      status: "pending",
      requestedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true, requested: true, msg: "Kërkesa u dërgua për miratim." };
}
