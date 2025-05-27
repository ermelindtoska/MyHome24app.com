// src/components/EditListingForm.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { auth } from '../firebase-config';

const EditListingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    city: '',
    price: '',
    type: '',
    purpose: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchListing = async () => {
      const ref = doc(db, 'listings', id);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.userId !== auth.currentUser?.uid) {
          alert('Nuk keni leje të modifikoni këtë shpallje.');
          navigate('/');
          return;
        }
        setForm(data);
      } else {
        alert('Shpallja nuk u gjet.');
        navigate('/');
      }
    };
    fetchListing();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'listings', id), form);
      alert('Shpallja u përditësua me sukses!');
      navigate('/listing/' + id);
    } catch (err) {
      console.error('Gabim gjatë përditësimit:', err);
      alert('Gabim gjatë përditësimit të shpalljes.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold mb-6">Përditëso shpalljen</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Titulli" className="w-full border p-3 rounded" />
        <input name="city" value={form.city} onChange={handleChange} placeholder="Qyteti" className="w-full border p-3 rounded" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Çmimi" className="w-full border p-3 rounded" type="number" />
        <input name="type" value={form.type} onChange={handleChange} placeholder="Tipi" className="w-full border p-3 rounded" />
        <input name="purpose" value={form.purpose} onChange={handleChange} placeholder="Qëllimi" className="w-full border p-3 rounded" />
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="Image URL" className="w-full border p-3 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">Ruaj ndryshimet</button>
      </form>
    </div>
  );
};

export default EditListingForm;
