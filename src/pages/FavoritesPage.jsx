// src/pages/FavoritesPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useTranslation } from 'react-i18next';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalContent, setModalContent] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const userData = userSnap.data();
      const favIds = userData.favorites || [];

      const listingsRef = collection(db, 'listings');
      const listingsSnap = await getDocs(listingsRef);
      const favListings = listingsSnap.docs
        .filter(doc => favIds.includes(doc.id))
        .map(doc => ({ id: doc.id, ...doc.data() }));

      setFavorites(favListings);
      setLoading(false);

      for (const fav of favListings) {
        const commentsRef = collection(db, 'listings', fav.id, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        onSnapshot(q, (snap) => {
          setComments(prev => ({
            ...prev,
            [fav.id]: snap.docs.map(doc => doc.data()),
          }));
        });
      }
    };

    fetchFavorites();
  }, []);

  const handleCommentChange = (listingId, field, value) => {
    setNewComments(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        [field]: value,
      },
    }));
  };

  const submitComment = async (listingId) => {
    const data = newComments[listingId];
    if (!data?.name || !data?.text || !data?.rating) return;
    await addDoc(collection(db, 'listings', listingId, 'comments'), {
      name: data.name,
      text: data.text,
      rating: parseInt(data.rating),
      createdAt: new Date(),
    });
    setNewComments(prev => ({ ...prev, [listingId]: { name: '', text: '', rating: 5 } }));
  };

  const averageRating = (comments) => {
    if (!comments || comments.length === 0) return null;
    const sum = comments.reduce((acc, c) => acc + (c.rating || 0), 0);
    return (sum / comments.length).toFixed(1);
  };

  const toggleCompare = (id) => {
    setCompareList(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const goToComparePage = () => {
    const items = favorites
      .filter(fav => compareList.includes(fav.id))
      .map(fav => ({
        title: fav.title,
        city: fav.city,
        price: fav.price,
        avgRating: averageRating(comments[fav.id])
      }));
    navigate('/compare', { state: { listings: items } });
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <nav className="text-sm mb-4 text-gray-500">{t('breadcrumbs.home')} / {t('favorites.title')}</nav>
      <h1 className="text-3xl font-bold mb-6 text-center">{t('favorites.title')}</h1>
      <p className="text-center text-gray-600 mb-8">{t('favorites.total')}: {favorites.length}</p>

      <div className="flex justify-end mb-6">
        <button onClick={goToComparePage} className="text-blue-600 hover:underline">
          {t('favorites.compare')} {compareList.length} {t('favorites.entries')}
        </button>
      </div>

      {favorites.length === 0 ? (
        <p className="text-center text-gray-500">{t('favorites.empty')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav) => (
            <div key={fav.id} className="border rounded-lg p-4 bg-white shadow relative">
              <Slider {...sliderSettings}>
                {(fav.imageUrls || [fav.imageUrl]).map((img, i) => (
                  <img key={i} src={img} alt={fav.title} className="w-full h-48 object-cover rounded" />
                ))}
              </Slider>
              <h2 className="text-xl font-bold mt-2">{fav.title}</h2>
              <p className="text-gray-600">{fav.city}</p>
              <p className="text-blue-600 font-bold">€{fav.price}</p>
              {averageRating(comments[fav.id]) && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⭐ {t('favorites.avgRating')}: {averageRating(comments[fav.id])}
                </p>
              )}
              <button
                onClick={() => toggleCompare(fav.id)}
                className="text-sm text-blue-500 hover:underline mt-2 block"
              >
                {compareList.includes(fav.id) ? t('favorites.removeFromCompare') : t('favorites.addToCompare')}
              </button>

              <div className="mt-4">
                <input
                  type="text"
                  placeholder={t('comments.name')}
                  value={newComments[fav.id]?.name || ''}
                  onChange={(e) => handleCommentChange(fav.id, 'name', e.target.value)}
                  className="w-full border p-2 mb-2 rounded"
                />
                <textarea
                  placeholder={t('comments.text')}
                  value={newComments[fav.id]?.text || ''}
                  onChange={(e) => handleCommentChange(fav.id, 'text', e.target.value)}
                  className="w-full border p-2 mb-2 rounded"
                />
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder={t('comments.rating')}
                  value={newComments[fav.id]?.rating || 5}
                  onChange={(e) => handleCommentChange(fav.id, 'rating', e.target.value)}
                  className="w-full border p-2 mb-2 rounded"
                />
                <button
                  onClick={() => submitComment(fav.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {t('comments.submit')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
