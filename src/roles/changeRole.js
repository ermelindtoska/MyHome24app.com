// src/roles/changeRole.js
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";

const ALLOWED_ROLES = ["user", "owner", "agent"];
const REQUESTABLE_ROLES = ["owner", "agent"];

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function isValidRole(role) {
  return ALLOWED_ROLES.includes(normalizeRole(role));
}

function isRequestableRole(role) {
  return REQUESTABLE_ROLES.includes(normalizeRole(role));
}

async function getCurrentUserOrThrow() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  return user;
}

async function isCurrentUserAdmin(user) {
  const token = await user.getIdTokenResult(true);
  return Boolean(token?.claims?.admin);
}

async function createRoleLog({
  type,
  userId,
  userEmail,
  targetUserId,
  targetRole,
  status,
  message,
  extra = {},
}) {
  try {
    await addDoc(collection(db, "logs"), {
      type,
      context: "roles",
      userId,
      userEmail: userEmail || "",
      targetUserId: targetUserId || "",
      targetRole: targetRole || "",
      status: status || "",
      message: message || "",
      extra,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("[changeRole] log could not be created:", error);
  }
}

/**
 * User kërkon upgrade për owner/agent.
 * Nuk ndryshon rolin direkt.
 */
export async function requestRoleUpgrade(targetRole, reason = "") {
  const user = await getCurrentUserOrThrow();
  const cleanRole = normalizeRole(targetRole);

  if (!isRequestableRole(cleanRole)) {
    throw new Error("INVALID_TARGET_ROLE");
  }

  const requestRef = doc(db, "roleUpgradeRequests", user.uid);

  const payload = {
    userId: user.uid,
    email: user.email || "",
    fullName: user.displayName || "",
    targetRole: cleanRole,
    reason:
      reason?.trim() ||
      "Self-service role upgrade request from MyHome24App.",
    status: "pending",
    requestedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(requestRef, payload, { merge: true });

  await createRoleLog({
    type: "role.requested",
    userId: user.uid,
    userEmail: user.email,
    targetUserId: user.uid,
    targetRole: cleanRole,
    status: "pending",
    message: `Role upgrade requested: ${cleanRole}`,
    extra: { reason: payload.reason },
  });

  return {
    ok: true,
    requested: true,
    targetRole: cleanRole,
    msg: "Kërkesa u dërgua për miratim.",
  };
}

/**
 * Admin ndryshon rolin e një user-i.
 * Përdoret nga AdminDashboard.
 */
export async function adminChangeUserRole(targetUserId, targetRole) {
  const adminUser = await getCurrentUserOrThrow();
  const cleanRole = normalizeRole(targetRole);

  if (!targetUserId) {
    throw new Error("MISSING_TARGET_USER_ID");
  }

  if (!isValidRole(cleanRole)) {
    throw new Error("INVALID_TARGET_ROLE");
  }

  const admin = await isCurrentUserAdmin(adminUser);

  if (!admin) {
    throw new Error("NOT_ADMIN");
  }

  const userRef = doc(db, "users", targetUserId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("TARGET_USER_NOT_FOUND");
  }

  await updateDoc(userRef, {
    role: cleanRole,
    roleUpdatedAt: serverTimestamp(),
    roleUpdatedBy: adminUser.uid,
  });

  await createRoleLog({
    type: "role.changed",
    userId: adminUser.uid,
    userEmail: adminUser.email,
    targetUserId,
    targetRole: cleanRole,
    status: "approved",
    message: `Admin changed user role to ${cleanRole}`,
  });

  return {
    ok: true,
    changed: true,
    targetUserId,
    targetRole: cleanRole,
    msg: "Roli u përditësua me sukses.",
  };
}

/**
 * Kompatibilitet me kodin e vjetër.
 * Nëse user është admin → ndryshon rolin e vet.
 * Nëse nuk është admin → krijon kërkesë upgrade.
 */
export async function requestOrChangeRole(targetRole) {
  const user = await getCurrentUserOrThrow();
  const cleanRole = normalizeRole(targetRole);

  if (!isValidRole(cleanRole)) {
    return {
      ok: false,
      msg: "Roli i zgjedhur nuk është i vlefshëm.",
    };
  }

  const admin = await isCurrentUserAdmin(user);

  if (admin) {
    await updateDoc(doc(db, "users", user.uid), {
      role: cleanRole,
      roleUpdatedAt: serverTimestamp(),
      roleUpdatedBy: user.uid,
    });

    await createRoleLog({
      type: "role.changed",
      userId: user.uid,
      userEmail: user.email,
      targetUserId: user.uid,
      targetRole: cleanRole,
      status: "approved",
      message: `Admin changed own role to ${cleanRole}`,
    });

    return {
      ok: true,
      changed: true,
      targetRole: cleanRole,
      msg: "Roli u përditësua.",
    };
  }

  if (cleanRole === "user") {
    return {
      ok: false,
      msg: "Vetëm admin-i mund ta ndryshojë rolin direkt.",
    };
  }

  return requestRoleUpgrade(cleanRole);
}