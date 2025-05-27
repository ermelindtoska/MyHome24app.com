import React from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onCancel}
        >
          <FiX size={18} />
        </button>
        <div className="flex items-center justify-center mb-4 text-red-600">
          <FiTrash2 size={32} />
        </div>
        <h2 className="text-xl font-semibold text-center mb-3">Are you sure?</h2>
        <p className="text-center text-gray-600 mb-4">This action cannot be undone.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;