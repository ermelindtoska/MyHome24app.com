import React, { useEffect, useMemo, useRef, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { FiSend, FiMessageSquare } from "react-icons/fi";

const ContactOwnerChat = ({ listingId, ownerId }) => {
  const { t } = useTranslation("contact");

  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const chatId = useMemo(() => {
    if (!currentUser?.uid || !ownerId || !listingId) return null;
    return currentUser.uid < ownerId
      ? `${currentUser.uid}_${ownerId}_${listingId}`
      : `${ownerId}_${currentUser.uid}_${listingId}`;
  }, [currentUser?.uid, ownerId, listingId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error("[ContactOwnerChat] Snapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    try {
      return timestamp.toDate().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();
    if (!text || !currentUser || !ownerId || !listingId || !chatId || sending) return;

    try {
      setSending(true);

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text,
        senderId: currentUser.uid,
        receiverId: ownerId,
        listingId,
        timestamp: serverTimestamp(),
      });

      setMessage("");
    } catch (error) {
      console.error("[ContactOwnerChat] Send error:", error);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {t("chat.loading", {
          defaultValue: "Chat wird geladen …",
        })}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {t("chat.loginHint", {
          defaultValue: "Bitte melden Sie sich an, um den Chat zu nutzen.",
        })}
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
            <FiMessageSquare className="text-lg" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t("chat.title", { defaultValue: "Verkäufer:in kontaktieren" })}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("chat.subtitle", {
                defaultValue: "Direkter Austausch zur Immobilie.",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-80 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-950/40">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {t("chat.empty", {
              defaultValue:
                "Noch keine Nachrichten. Stellen Sie Ihre erste Frage zur Immobilie.",
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.senderId === currentUser.uid;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                      isOwn
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {msg.text}
                    </p>
                    <div
                      className={`mt-1 text-[11px] ${
                        isOwn ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-end gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("chat.placeholder", {
              defaultValue: "Nachricht schreiben …",
            })}
            className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            disabled={sending}
          />

          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSend />
            {sending
              ? t("chat.sending", { defaultValue: "Wird gesendet…" })
              : t("chat.send", { defaultValue: "Senden" })}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactOwnerChat;