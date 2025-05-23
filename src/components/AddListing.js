import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function AddListing({ user, filters, setModalListing }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'rent',
    location: '',
    category: 'apartment',
    price: '',
    images: []
  });

  const [listings, setListings] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("listings");
    if (saved) {
      setListings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("listings", JSON.stringify(listings));
  }, [listings]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      const selected = Array.from(files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setForm({ ...form, images: selected });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newListing = {
      ...form,
      user,
      timestamp: new Date().toLocaleString()
    };
    setListings([newListing, ...listings]);
    setForm({ title: '', description: '', type: 'rent', location: '', category: 'apartment', price: '', images: [] });
  };

  const handleDelete = (index) => {
    const updated = listings.filter((_, i) => i !== index);
    setListings(updated);
  };

  const filteredListings = listings.filter((item) => {
    const keywordMatch = filters.keyword === '' || item.title.toLowerCase().includes(filters.keyword.toLowerCase());
    const typeMatch = filters.type === '' || item.type === filters.type;
    const cityMatch = filters.city === '' || item.location.toLowerCase().includes(filters.city.toLowerCase());
    const categoryMatch = filters.category === '' || item.category === filters.category;
    return keywordMatch && typeMatch && cityMatch && categoryMatch;
  });

  return (
    <div style={{ marginTop: '40px' }}>
      <form onSubmit={handleSubmit}>
        <h2>{t("formTitle")}</h2>
        <input name="title" placeholder={t("title")} value={form.title} onChange={handleChange} required /><br /><br />
        <textarea name="description" placeholder={t("descriptionField")} value={form.description} onChange={handleChange} required /><br /><br />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="rent">{t("rent")}</option>
          <option value="sale">{t("sale")}</option>
        </select><br /><br />
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="apartment">{t("apartment")}</option>
          <option value="house">{t("house")}</option>
          <option value="office">{t("office")}</option>
        </select><br /><br />
        <input name="location" placeholder={t("location")} value={form.location} onChange={handleChange} required /><br /><br />
        <input name="price" placeholder={t("price")} type="number" value={form.price} onChange={handleChange} required /><br /><br />
        <input name="images" type="file" accept="image/*" onChange={handleChange} multiple /><br /><br />
        <button type="submit">{t("submit")}</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '40px' }}>
        {filteredListings.map((item, index) => (
          <div key={index} onClick={() => setModalListing(item)} style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '15px',
            boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            backgroundColor: 'white'
          }}>
            {item.images && item.images.length > 0 && (
              <img src={item.images[0].url} alt="Foto" style={{ width: '100%', borderRadius: '10px' }} />
            )}
            <h3>{item.title}</h3>
            <p><b>{t("price")}:</b> {item.price} €</p>
            <p><b>{t("location")}:</b> {item.location}</p>
            {item.user === user && (
              <button onClick={(e) => { e.stopPropagation(); handleDelete(index); }}>{t("delete")}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
