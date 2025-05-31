import React from 'react';
import { FaTimes } from 'react-icons/fa';

const SpecialFeatureModal = ({ feature, onClose }) => {
  if (!feature) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">
          <FaTimes size={20} />
        </button>
        <div className="text-blue-600 text-4xl mb-4 flex justify-center">{feature.icon}</div>
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">{feature.title}</h2>
        <p className="text-gray-600 text-center">{feature.description}</p>
      </div>
    </div>
  );
};

export default SpecialFeatureModal;
