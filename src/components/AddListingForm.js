// src/components/AddListingForm.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

const AddListingForm = ({ onAddListing }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    price: '',
    type: 'Miete',
    category: 'Wohnung',
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setForm({ ...form, images: urls });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newListing = {
      id: uuidv4(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('listings')) || [];
    localStorage.setItem('listings', JSON.stringify([...existing, newListing]));
    if (onAddListing) onAddListing(newListing);
    setForm({
      title: '', description: '', city: '', price: '', type: 'Miete', category: 'Wohnung', images: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">{t('addListing')}</h2>
      <input name="title" placeholder={t('title')} value={form.title} onChange={handleChange} className="input input-bordered w-full" required />
      <textarea name="description" placeholder={t('description')} value={form.description} onChange={handleChange} className="textarea textarea-bordered w-full" required />
      <input name="city" placeholder={t('city')} value={form.city} onChange={handleChange} className="input input-bordered w-full" required />
      <input name="price" placeholder={t('price')} value={form.price} onChange={handleChange} className="input input-bordered w-full" type="number" />

      <div className="grid grid-cols-2 gap-4">
        <select name="type" value={form.type} onChange={handleChange} className="select select-bordered">
          <option value="Miete">{t('rent')}</option>
          <option value="Verkauf">{t('sale')}</option>
        </select>
        <select name="category" value={form.category} onChange={handleChange} className="select select-bordered">
          <option value="Wohnung">{t('apartment')}</option>
          <option value="Haus">{t('house')}</option>
          <option value="Büro">{t('office')}</option>
        </select>
      </div>

      <input type="file" multiple onChange={handleImageUpload} className="file-input file-input-bordered w-full" />
      <button type="submit" className="btn btn-primary w-full">{t('submit')}</button>
    </form>
  );
};

export default AddListingForm;
