import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm({ title: '', city: '', price: '', type: 'apartment', purpose: 'rent', image: null });
  };

  return (
    <div className="bg-white p-4 rounded shadow-md w-full max-w-md mx-auto mt-4">
      <h2 className="text-lg font-bold mb-2">{t('addListing.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder={t('addListing.fields.title')}
          className="w-full p-2 border rounded"
        />
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder={t('addListing.fields.city')}
          className="w-full p-2 border rounded"
        />
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder={t('addListing.fields.price')}
          className="w-full p-2 border rounded"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="apartment">{t('addListing.fields.apartment')}</option>
          <option value="house">{t('addListing.fields.house')}</option>
        </select>
        <select
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="rent">{t('addListing.fields.rent')}</option>
          <option value="buy">{t('addListing.fields.buy')}</option>
        </select>
        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {t('addListing.submit')}
        </button>
      </form>
    </div>
  );
};

export default DashboardPage;
