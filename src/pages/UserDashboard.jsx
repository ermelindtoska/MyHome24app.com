// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  FiTrash2, FiEdit, FiHeart, FiPlusCircle, FiSearch,
  FiEye, FiX, FiMapPin, FiMessageCircle, FiMap
} from 'react-icons/fi';
import FilterControls from '../components/FilterControls';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ContactOwnerModal from '../components/ContactOwnerModal';
import ListingMapModal from '../components/ListingMapModal';

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
  const [selectedListing, setSelectedListing] = useState(null);
  const [showConfirmId, setShowConfirmId] = useState(null);
  const [showContact, setShowContact] = useState(null);
  const [showMap, setShowMap] = useState(null);

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'listings'), where('userId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        const now = Timestamp.now();
        const data = snapshot.docs.map((doc) => {
          const createdAt = doc.data().createdAt?.seconds || 0;
          const isNew = now.seconds - createdAt < 7 * 24 * 3600;
          return { id: doc.id, ...doc.data(), isNew };
        });
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
    try {
      await deleteDoc(doc(db, 'listings', id));
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
    setShowConfirmId(null);
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FiSearch className="text-blue-600" /> {t('dashboard.title')}
        </h2>
        <Link to="/add" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <FiPlusCircle size={18} /> {t('dashboard.addNew')}
        </Link>
      </div>

      <FilterControls
        filterCity={filterCity}
        setFilterCity={setFilterCity}
        filterType={filterType}
        setFilterType={setFilterType}
        filterPurpose={filterPurpose}
        setFilterPurpose={setFilterPurpose}
      />

      {filteredListings.length === 0 ? (
        <p className="text-center text-gray-500 italic">{t('dashboard.noListings')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {listing.imageUrl && (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  loading="lazy"
                  className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 truncate" title={listing.title}>
                    {listing.title}
                  </h3>
                  {listing.isNew && (
                    <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                      {t('dashboard.new')}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  <FiMapPin className="inline mr-1 text-blue-500" /> {listing.city} – {t(`addListing.fields.${listing.type}`)} – {t(`addListing.fields.${listing.purpose}`)}
                </p>
                <p className="text-blue-700 font-bold mt-2">€{listing.price}</p>

                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="text-sm text-blue-500 hover:underline"
                    title={t('dashboard.details')}
                  >
                    <FiEye className="inline mr-1" /> {t('dashboard.details')}
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmId(listing.id)}
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
                      title={favorites.includes(listing.id) ? t('dashboard.unfavorite') : t('dashboard.favorite')}
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

      {showConfirmId && (
        <ConfirmDeleteModal
          onCancel={() => setShowConfirmId(null)}
          onConfirm={() => handleDelete(showConfirmId)}
        />
      )}

      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelectedListing(null)}
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedListing.title}</h2>
            <p className="text-sm text-gray-600 mb-2">
              <FiMapPin className="inline mr-1 text-blue-500" />
              {selectedListing.city} – {t(`addListing.fields.${selectedListing.type}`)} – {t(`addListing.fields.${selectedListing.purpose}`)}
            </p>
            <p className="text-blue-700 font-bold mb-4">€{selectedListing.price}</p>
            {selectedListing.imageUrl && (
              <img
                src={selectedListing.imageUrl}
                alt={selectedListing.title}
                className="w-full h-64 object-cover rounded"
              />
            )}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <button
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                onClick={() => setShowContact(selectedListing)}
              >
                <FiMessageCircle /> {t('dashboard.contactOwner')}
              </button>
              <button
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:underline"
                onClick={() => setShowMap(selectedListing)}
              >
                <FiMap /> {t('dashboard.viewMap')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContact && (
        <ContactOwnerModal listing={showContact} onClose={() => setShowContact(null)} />
      )}

      {showMap && (
        <ListingMapModal listing={showMap} onClose={() => setShowMap(null)} />
      )}
    </div>
  );
};

export default UserDashboard;
