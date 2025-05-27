// src/components/ContactOwnerModal.jsx
import React from 'react';
import { FiX } from 'react-icons/fi';

const ContactOwnerModal = ({ listing, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <FiX size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Kontakt Eigentümer*in</h2>
        <p><strong>Objekt:</strong> {listing.title}</p>
        <p className="mt-2 text-sm text-gray-600">Hier könnten Kontaktdaten oder ein Formular stehen.</p>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactOwnerModal;
