// src/components/ContactOwnerChat.jsx
import React, { useEffect, useState } from "react";
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

const ContactOwnerChat = ({ listingId, ownerId }) => {
  const { t } = useTranslation("contact");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Aktuellen User holen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Chat-ID deterministisch aus User + Owner + Listing bilden
  const getChatId = (uid, owner, listing) => {
    if (!uid || !owner || !listing) return null;
    return uid < owner
      ? `${uid}_${owner}_${listing}`
      : `${owner}_${uid}_${listing}`;
  };

  // Nachrichten live laden
  useEffect(() => {
    if (!listingId || !currentUser || !ownerId) return;

    const chatId = getChatId(currentUser.uid, ownerId, listingId);
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [listingId, ownerId, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || !ownerId || !listingId) return;

    const chatId = getChatId(currentUser.uid, ownerId, listingId);
    if (!chatId) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: message.trim(),
      senderId: currentUser.uid,
      receiverId: ownerId,
      listingId,
      timestamp: serverTimestamp(),
    });

    setMessage("");
  };

  if (!currentUser) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("chat.loginHint", {
          defaultValue: "Bitte melden Sie sich an, um den Chat zu nutzen.",
        })}
      </p>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-base font-semibold mb-2">
        {t("chat.title", { defaultValue: "Verkäufer:in kontaktieren" })}
      </h3>

      <div className="max-h-64 overflow-y-auto mb-3 space-y-1 text-sm">
        {messages.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            {t("chat.empty", {
              defaultValue:
                "Noch keine Nachrichten. Stellen Sie Ihre erste Frage zur Immobilie.",
            })}
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`px-3 py-1.5 rounded-xl inline-block max-w-[80%] break-words ${
              msg.senderId === currentUser.uid
                ? "bg-blue-600 text-white ml-auto block text-right"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          className="flex-grow px-3 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("chat.placeholder", {
            defaultValue: "Nachricht schreiben …",
          })}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          {t("chat.send", { defaultValue: "Senden" })}
        </button>
      </form>
    </div>
  );
};

export default ContactOwnerChat;
