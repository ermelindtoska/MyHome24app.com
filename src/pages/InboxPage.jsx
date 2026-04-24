// src/pages/InboxPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../roles/RoleContext";
import { useAuth } from "../context/AuthContext";
import {
  FiInbox,
  FiCheck,
  FiX,
  FiMail,
  FiShield,
  FiHelpCircle,
  FiMessageCircle,
} from "react-icons/fi";

function getDate(source) {
  const ts =
    source?.createdAt ||
    source?.requestedAt ||
    source?.timestamp ||
    source?.sentAt ||
    source?.updatedAt ||
    source?.repliedAt ||
    null;

  if (ts?.toDate) return ts.toDate();
  if (ts?.seconds) return new Date(ts.seconds * 1000);
  return null;
}

function formatDate(source, locale = "de-DE") {
  const date = getDate(source);
  return date ? date.toLocaleString(locale) : "—";
}

function normalizeStatus(status) {
  return String(status || "open").toLowerCase();
}

function uniqueBySourceAndId(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.source}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function safeGetDocs(q, label) {
  try {
    const snap = await getDocs(q);
    return snap.docs;
  } catch (error) {
    console.warn(`[InboxPage] ${label} could not be loaded:`, error);
    return [];
  }
}

async function safeGetSingleDoc(ref, label) {
  try {
    const snap = await getDoc(ref);
    return snap.exists() ? snap : null;
  } catch (error) {
    console.warn(`[InboxPage] ${label} could not be loaded:`, error);
    return null;
  }
}

export default function InboxPage() {
  const { t, i18n } = useTranslation("inbox");
  const { role, loading: roleLoading } = useRole();
  const { currentUser, loading: authLoading } =
    useAuth() ?? { currentUser: null, loading: true };

  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const effectiveRole = String(role || "user").toLowerCase();
  const isAdmin = effectiveRole === "admin";
  const locale = i18n.language?.startsWith("en") ? "en-US" : "de-DE";

  const mapRoleRequest = (docSnap) => {
    const data = docSnap.data() || {};

    return {
      id: docSnap.id,
      source: "roleUpgradeRequests",
      type: "role",
      title: t("labels.roleRequest", {
        defaultValue: "Rollenwechsel-Anfrage",
      }),
      from: data.email || data.userEmail || "—",
      name: data.fullName || data.userName || "—",
      message: data.reason || "—",
      status: data.status || "pending",
      targetRole: data.targetRole || "owner",
      raw: data,
    };
  };

  const mapSupportMessage = (docSnap) => {
    const data = docSnap.data() || {};

    return {
      id: docSnap.id,
      source: "supportMessages",
      type: "support",
      title:
        data.category ||
        t("labels.supportRequest", {
          defaultValue: "Support-Anfrage",
        }),
      from: data.email || data.userEmail || "—",
      name: data.name || data.fullName || data.userName || "—",
      message: data.message || "—",
      status: data.status || "open",
      raw: data,
    };
  };

  const mapContactMessage = (docSnap) => {
    const data = docSnap.data() || {};

    return {
      id: docSnap.id,
      source: "contacts",
      type: "contact",
      title:
        data.listingTitle ||
        data.subject ||
        t("labels.contactRequest", {
          defaultValue: "Kontaktanfrage",
        }),
      from: data.email || data.userEmail || "—",
      name: data.name || data.fullName || data.userName || "—",
      message: data.message || "—",
      status: data.status || "open",
      raw: data,
    };
  };

  const mapOfferMessage = (docSnap) => {
    const data = docSnap.data() || {};

    return {
      id: docSnap.id,
      source: "offers",
      type: "offer",
      title:
        data.listingTitle ||
        t("labels.offerRequest", {
          defaultValue: "Kaufangebot",
        }),
      from: data.buyerEmail || data.email || data.userEmail || "—",
      name: data.buyerName || data.name || "—",
      message:
        data.message ||
        `${t("labels.offerAmount", {
          defaultValue: "Angebot",
        })}: ${data.amount || "—"} €`,
      status: data.status || "open",
      raw: data,
    };
  };

  const mapDirectMessage = (docSnap) => {
    const data = docSnap.data() || {};

    return {
      id: docSnap.id,
      source: "messages",
      type: "message",
      title:
        data.subject ||
        data.listingTitle ||
        t("labels.directMessage", {
          defaultValue: "Direkte Nachricht",
        }),
      from: data.senderEmail || data.email || "—",
      name: data.senderName || data.name || "—",
      message: data.text || data.message || "—",
      status: data.status || "open",
      raw: data,
    };
  };

  useEffect(() => {
    if (authLoading || roleLoading) return;

    const loadInbox = async () => {
      setLoading(true);

      try {
        if (!currentUser?.uid) {
          setItems([]);
          setLoading(false);
          return;
        }

        const uid = currentUser.uid;
        const email = currentUser.email || "";

        let loadedItems = [];

        if (isAdmin) {
          const [roleDocs, supportDocs, contactDocs, offerDocs, messageDocs] =
            await Promise.all([
              safeGetDocs(
                collection(db, "roleUpgradeRequests"),
                "admin roleUpgradeRequests"
              ),
              safeGetDocs(
                collection(db, "supportMessages"),
                "admin supportMessages"
              ),
              safeGetDocs(collection(db, "contacts"), "admin contacts"),
              safeGetDocs(collection(db, "offers"), "admin offers"),
              safeGetDocs(collection(db, "messages"), "admin messages"),
            ]);

          loadedItems = [
            ...roleDocs.map(mapRoleRequest),
            ...supportDocs.map(mapSupportMessage),
            ...contactDocs.map(mapContactMessage),
            ...offerDocs.map(mapOfferMessage),
            ...messageDocs.map(mapDirectMessage),
          ];
        } else {
          const ownRoleRequest = await safeGetSingleDoc(
            doc(db, "roleUpgradeRequests", uid),
            "own roleUpgradeRequest"
          );

          const contactDocsByUser = await safeGetDocs(
            query(collection(db, "contacts"), where("userId", "==", uid)),
            "contacts by userId"
          );

          const contactDocsByOwner = await safeGetDocs(
            query(collection(db, "contacts"), where("ownerId", "==", uid)),
            "contacts by ownerId"
          );

          const offerDocsByBuyer = await safeGetDocs(
            query(collection(db, "offers"), where("buyerId", "==", uid)),
            "offers by buyerId"
          );

          const offerDocsByOwner = await safeGetDocs(
            query(collection(db, "offers"), where("ownerId", "==", uid)),
            "offers by ownerId"
          );

          const messageDocsBySender = await safeGetDocs(
            query(collection(db, "messages"), where("senderId", "==", uid)),
            "messages by senderId"
          );

          const messageDocsByReceiver = await safeGetDocs(
            query(collection(db, "messages"), where("receiverId", "==", uid)),
            "messages by receiverId"
          );

          const supportDocsByUser = await safeGetDocs(
            query(collection(db, "supportMessages"), where("userId", "==", uid)),
            "supportMessages by userId"
          );

          const supportDocsByEmail = email
            ? await safeGetDocs(
                query(
                  collection(db, "supportMessages"),
                  where("email", "==", email)
                ),
                "supportMessages by email"
              )
            : [];

          loadedItems = [
            ...(ownRoleRequest ? [mapRoleRequest(ownRoleRequest)] : []),
            ...contactDocsByUser.map(mapContactMessage),
            ...contactDocsByOwner.map(mapContactMessage),
            ...offerDocsByBuyer.map(mapOfferMessage),
            ...offerDocsByOwner.map(mapOfferMessage),
            ...messageDocsBySender.map(mapDirectMessage),
            ...messageDocsByReceiver.map(mapDirectMessage),
            ...supportDocsByUser.map(mapSupportMessage),
            ...supportDocsByEmail.map(mapSupportMessage),
          ];
        }

        const uniqueItems = uniqueBySourceAndId(loadedItems);

        uniqueItems.sort((a, b) => {
          const da = getDate(a.raw)?.getTime?.() || 0;
          const db = getDate(b.raw)?.getTime?.() || 0;
          return db - da;
        });

        setItems(uniqueItems);
      } catch (error) {
        console.error("[InboxPage] load error:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadInbox();
  }, [authLoading, roleLoading, currentUser?.uid, currentUser?.email, isAdmin]);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((item) => item.type === tab);
  }, [items, tab]);

  const updateItemStatus = async (item, status) => {
    if (!isAdmin) return;

    const shouldAskReply = status === "rejected" || status === "done";

    const reply = shouldAskReply
      ? window.prompt(
          t("prompts.reply", {
            defaultValue: "Kommentar / Antwort an Nutzer:in:",
          }),
          item.raw.adminReply || ""
        )
      : "";

    try {
      await updateDoc(doc(db, item.source, item.id), {
        status,
        adminReply: reply || item.raw.adminReply || "",
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (item.type === "role" && status === "approved") {
        await updateDoc(doc(db, "users", item.raw.userId), {
          role: item.targetRole || "owner",
          roleUpdatedAt: serverTimestamp(),
        });
      }

      setItems((prev) =>
        prev.map((x) =>
          x.id === item.id && x.source === item.source
            ? {
                ...x,
                status,
                raw: {
                  ...x.raw,
                  status,
                  adminReply: reply || x.raw.adminReply || "",
                },
              }
            : x
        )
      );
    } catch (error) {
      console.error("[InboxPage] update status error:", error);
      alert(
        t("errors.updateFailed", {
          defaultValue: "Fehler beim Aktualisieren.",
        })
      );
    }
  };

  const tabs = [
    ["all", t("tabs.all", { defaultValue: "Alle" })],
    ["role", t("tabs.roles", { defaultValue: "Rollen" })],
    ["contact", t("tabs.contact", { defaultValue: "Kontakt" })],
    ["support", t("tabs.support", { defaultValue: "Support" })],
    ["offer", t("tabs.offers", { defaultValue: "Angebote" })],
    ["message", t("tabs.messages", { defaultValue: "Nachrichten" })],
  ];

  if (authLoading || roleLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-500 dark:text-slate-400">
            {t("loading", {
              defaultValue: "Nachrichten werden geladen…",
            })}
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h1 className="text-2xl font-bold dark:text-white">
            {t("authRequired.title", {
              defaultValue: "Anmeldung erforderlich",
            })}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {t("authRequired.text", {
              defaultValue:
                "Bitte melde dich an, um deine Nachrichten zu sehen.",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <FiInbox />
            {t("badge", {
              defaultValue: "Nachrichtenzentrale",
            })}
          </div>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {t("title", {
              defaultValue: "Inbox",
            })}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isAdmin
              ? t("subtitleAdmin", {
                  defaultValue:
                    "Alle Rollen-Anfragen, Kontaktanfragen, Support-Nachrichten und Angebote an einem Ort.",
                })
              : t("subtitleUser", {
                  defaultValue:
                    "Hier findest du deine Nachrichten, Anfragen, Antworten und Status-Updates.",
                })}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === key
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            {t("empty", {
              defaultValue: "Keine Nachrichten vorhanden.",
            })}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filtered.map((item) => (
              <div
                key={`${item.source}-${item.id}`}
                className="grid gap-4 p-5 md:grid-cols-[48px_1fr_auto] md:items-start"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-blue-600 dark:bg-slate-900 dark:text-blue-300">
                  {item.type === "role" && <FiShield />}
                  {item.type === "contact" && <FiMail />}
                  {item.type === "support" && <FiHelpCircle />}
                  {item.type === "offer" && <FiInbox />}
                  {item.type === "message" && <FiMessageCircle />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h2>
                    <StatusBadge status={item.status} t={t} />
                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t("labels.from", { defaultValue: "Von" })}: {item.name} ·{" "}
                    {item.from} · {formatDate(item.raw, locale)}
                  </p>

                  <p className="mt-3 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                    {item.message}
                  </p>

                  {item.raw.adminReply && (
                    <div className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                      <strong>
                        {t("labels.reply", { defaultValue: "Antwort" })}:
                      </strong>{" "}
                      {item.raw.adminReply}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {isAdmin &&
                    item.type === "role" &&
                    normalizeStatus(item.status) === "pending" && (
                      <>
                        <button
                          onClick={() => updateItemStatus(item, "approved")}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          <FiCheck />
                          {t("actions.approve", {
                            defaultValue: "Genehmigen",
                          })}
                        </button>

                        <button
                          onClick={() => updateItemStatus(item, "rejected")}
                          className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          <FiX />
                          {t("actions.reject", {
                            defaultValue: "Ablehnen",
                          })}
                        </button>
                      </>
                    )}

                  {isAdmin &&
                    item.type !== "role" &&
                    normalizeStatus(item.status) !== "done" && (
                      <button
                        onClick={() => updateItemStatus(item, "done")}
                        className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        {t("actions.resolveReply", {
                          defaultValue: "Erledigen / Antworten",
                        })}
                      </button>
                    )}

                  {!isAdmin && (
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      {t("labels.statusOnly", {
                        defaultValue: "Status sichtbar",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, t }) {
  const normalized = normalizeStatus(status);

  const classes =
    normalized === "approved" ||
    normalized === "done" ||
    normalized === "resolved" ||
    normalized === "accepted"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      : normalized === "rejected" || normalized === "declined"
      ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {t(`status.${normalized}`, {
        defaultValue: status || "open",
      })}
    </span>
  );
}