// src/components/ContactOwnerModal.jsx
import React from 'react';
import { FaEnvelope } from 'react-icons/fa';

const ContactOwnerModal = ({ isOpen, onClose, listing }) => {
  if (!isOpen || !listing) return null;

const handleSend = () => {
    alert(`Nachricht gesendet an ${ownerEmail}:\n${message}`);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Kontakt zum Vermieter</h2>
        <textarea
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
          placeholder="Ihre Nachricht..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Abbrechen</button>
          <button onClick={handleSend} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Senden</button>
        </div>
      </div>
    </div>
  );
};

export default ContactOwnerModal;
