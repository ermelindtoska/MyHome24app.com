// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiTrash2, FiEdit, FiHeart, FiPlusCircle, FiSearch } from 'react-icons/fi';

const UserDashboard = () => {
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites') || '[]'));

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'listings'),
          where('userId', '==', auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setListings(data);
      } catch (error) {
        console.error('Fehler beim Abrufen der Einträge:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserListings();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm(t('dashboard.confirmDelete'));
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, 'listings', id));
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  const handleUpdate = async (id) => {
    if (!newTitle.trim()) return;
    try {
      await updateDoc(doc(db, 'listings', id), { title: newTitle });
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
      );
      setEditingId(null);
      setNewTitle('');
    } catch (err) {
      console.error('Fehler beim Aktualisieren:', err);
    }
  };

  const toggleFavorite = (id) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const filteredListings = listings.filter((listing) => {
    return (
      (filterCity ? listing.city.toLowerCase().includes(filterCity.toLowerCase()) : true) &&
      (filterType ? listing.type === filterType : true) &&
      (filterPurpose ? listing.purpose === filterPurpose : true)
    );
  });

  if (loading) return <p className="text-center p-4">{t('dashboard.loading')}</p>;

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FiSearch className="text-blue-600" /> {t('dashboard.title')}
        </h2>
        <Link to="/add" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <FiPlusCircle size={18} /> {t('dashboard.addNew')}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <input
          type="text"
          placeholder={t('filter.city')}
          className="border px-3 py-2 rounded w-full"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">{t('filter.allTypes')}</option>
          <option value="apartment">{t('addListing.fields.apartment')}</option>
          <option value="house">{t('addListing.fields.house')}</option>
        </select>
        <select
          value={filterPurpose}
          onChange={(e) => setFilterPurpose(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">{t('filter.allPurposes')}</option>
          <option value="rent">{t('addListing.fields.rent')}</option>
          <option value="buy">{t('addListing.fields.buy')}</option>
        </select>
      </div>

      {filteredListings.length === 0 ? (
        <p className="text-center text-gray-500 italic">{t('dashboard.noListings')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {listing.imageUrl && (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                {editingId === listing.id ? (
                  <div className="mb-2">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <button
                      onClick={() => handleUpdate(listing.id)}
                      className="mt-2 text-sm text-green-600 hover:underline"
                    >
                      {t('dashboard.save')}
                    </button>
                  </div>
                ) : (
                  <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">{listing.title}</h3>
                )}

                <p className="text-gray-600 text-sm">
                  {listing.city} – {t(`addListing.fields.${listing.type}`)} – {t(`addListing.fields.${listing.purpose}`)}
                </p>
                <p className="text-blue-700 font-bold mt-2">€{listing.price}</p>

                <div className="flex justify-between items-center mt-4">
                  <Link
                    to={`/listing/${listing.id}`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {t('dashboard.details')}
                  </Link>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDelete(listing.id)}
                      title={t('dashboard.delete')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(listing.id);
                        setNewTitle(listing.title);
                      }}
                      title={t('dashboard.edit')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      title={favorites.includes(listing.id) ? 'Unfavorite' : 'Favorite'}
                      className={`hover:text-pink-600 ${favorites.includes(listing.id) ? 'text-pink-500' : 'text-gray-400'}`}
                    >
                      <FiHeart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
