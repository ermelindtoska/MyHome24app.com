import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaCheckCircle } from 'react-icons/fa';

const DashboardPage = ({ onAdd }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    city: '',
    price: '',
    type: 'apartment',
    purpose: 'rent',
    image: null,
  });
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setForm({ ...form, image: file });
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.city || !form.price || !form.image) {
      alert(t('addListing.validation'));
      return;
    }

    onAdd(form);
    setForm({
      title: '',
      city: '',
      price: '',
      type: 'apartment',
      purpose: 'rent',
      image: null,
    });
    setPreview(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl mx-auto mt-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">{t('addListing.title')}</h2>

      {success && (
        <div className="flex items-center gap-2 text-green-600 mb-4 justify-center">
          <FaCheckCircle /> <span>{t('addListing.success')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder={t('addListing.fields.title')}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder={t('addListing.fields.city')}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder={t('addListing.fields.price')}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-4">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="apartment">{t('addListing.fields.apartment')}</option>
            <option value="house">{t('addListing.fields.house')}</option>
          </select>
          <select
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            className="w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rent">{t('addListing.fields.rent')}</option>
            <option value="buy">{t('addListing.fields.buy')}</option>
          </select>
        </div>

        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        {preview && (
          <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg shadow-sm border mt-2" />
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
        >
          <FaPlus /> {t('addListing.submit')}
        </button>
      </form>
    </div>
  );
};

export default DashboardPage;
