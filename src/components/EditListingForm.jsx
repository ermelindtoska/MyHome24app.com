// src/components/EditListingForm.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useTranslation } from 'react-i18next';

const EditListingForm = () => {
  const { t } = useTranslation('editListing');
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    city: '',
    price: '',
    type: '',
    purpose: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const ref = doc(db, 'listings', id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
          alert(t('notFoundAlert', { defaultValue: 'Anzeige nicht gefunden.' }));
          navigate('/');
          return;
        }

        const data = snapshot.data();

        // Siguri: vetëm pronari mund të editojë
        if (data.userId && data.userId !== auth.currentUser?.uid) {
          alert(
            t('notOwnerAlert', {
              defaultValue: 'Du darfst diese Anzeige nicht bearbeiten.',
            })
          );
          navigate('/');
          return;
        }

        setForm({
          title: data.title || '',
          city: data.city || '',
          price: data.price || '',
          type: data.type || '',
          purpose: data.purpose || '',
          imageUrl:
            data.images?.[0] ||
            data.imageUrls?.[0] ||
            data.imageUrl ||
            '',
        });
      } catch (err) {
        console.error('[EditListingForm] fetch error:', err);
        alert(
          t('loadError', {
            defaultValue: 'Fehler beim Laden der Anzeige.',
          })
        );
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'listings', id), {
        title: form.title,
        city: form.city,
        price: Number(form.price) || form.price,
        type: form.type,
        purpose: form.purpose,
        imageUrl: form.imageUrl,
      });

      alert(
        t('updateSuccess', {
          defaultValue: 'Anzeige wurde aktualisiert.',
        })
      );
      navigate(`/listing/${id}`);
    } catch (err) {
      console.error('[EditListingForm] update error:', err);
      alert(
        t('updateError', {
          defaultValue: 'Fehler beim Aktualisieren.',
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        {t('loading', { defaultValue: 'Anzeige wird geladen…' })}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {t('titlePage', { defaultValue: 'Anzeige bearbeiten' })}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border border-gray-200 dark:border-gray-700"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('fields.title', { defaultValue: 'Titel' })}
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('fields.city', { defaultValue: 'Stadt' })}
          </label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('fields.price', { defaultValue: 'Preis' })}
          </label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('fields.type', { defaultValue: 'Immobilientyp' })}
            </label>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('fields.purpose', { defaultValue: 'Zweck (buy/rent)' })}
            </label>
            <input
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('fields.imageUrl', { defaultValue: 'Bild-URL' })}
          </label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            {t('saveButton', { defaultValue: 'Änderungen speichern' })}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListingForm;
