import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // sigurohu që këto janë eksportuar nga firebase.js
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ContactOwnerChat = ({ listingId, ownerId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Merr përdoruesin aktual
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Merr mesazhet në kohë reale
  useEffect(() => {
    if (!listingId || !currentUser) return;

    const chatId =
      currentUser.uid < ownerId
        ? `${currentUser.uid}_${ownerId}_${listingId}`
        : `${ownerId}_${currentUser.uid}_${listingId}`;

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
    if (!message.trim() || !currentUser) return;

    const chatId =
      currentUser.uid < ownerId
        ? `${currentUser.uid}_${ownerId}_${listingId}`
        : `${ownerId}_${currentUser.uid}_${listingId}`;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: message,
      senderId: currentUser.uid,
      receiverId: ownerId,
      timestamp: serverTimestamp(),
    });

    setMessage("");
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow mt-6">
      <h3 className="text-lg font-semibold mb-2">Kontakto pronarin</h3>

      <div className="max-h-64 overflow-y-auto mb-4 border p-2 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 my-1 rounded ${
              msg.senderId === currentUser?.uid
                ? "bg-blue-100 text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          className="flex-grow p-2 border rounded"
          placeholder="Shkruaj mesazhin..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Dërgo
        </button>
      </form>
    </div>
  );
};

export default ContactOwnerChat;
