// src/components/ListingModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ListingModal = ({ listing, onClose, onDelete, onUpdate, currentUser }) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...listing });

  if (!listing) return null;

  const handleEditToggle = () => setEditMode(!editMode);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleUpdate = () => {
    onUpdate(form);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ✖
        </button>

        {editMode ? (
          <div className="space-y-3">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder={t('title')}
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder={t('description')}
            />
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder={t('city')}
            />
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder={t('price')}
            />
            <div className="flex gap-4">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="Miete">{t('rent')}</option>
                <option value="Verkauf">{t('sale')}</option>
              </select>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="Wohnung">{t('apartment')}</option>
                <option value="Haus">{t('house')}</option>
                <option value="Büro">{t('office')}</option>
              </select>
            </div>
            <button
              onClick={handleUpdate}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              {t('submit')}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-2">{listing.title}</h2>
            <p className="text-gray-700">{listing.description}</p>
            <p className="mt-2">📍 {listing.city}</p>
            <p className="text-blue-600 font-bold mt-2">{parseFloat(listing.price).toLocaleString()} €</p>
            <p className="text-sm text-gray-400 mt-1">{listing.category} – {listing.type}</p>
            <div className="mt-4 h-64 w-full">
              <iframe
                title="map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(listing.city)}&output=embed`}
              ></iframe>
            </div>
            {currentUser === listing.owner && (
              <div className="mt-4 flex gap-4">
                <button
                  onClick={handleEditToggle}
                  className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                >
                  ✏️ {t('edit')}
                </button>
                <button
                  onClick={() => onDelete(listing.id)}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                >
                  🗑 {t('delete')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingModal;
