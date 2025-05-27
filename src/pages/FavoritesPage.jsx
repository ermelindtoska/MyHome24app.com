// src/pages/FavoritesPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const FavoritesPage = () => {
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
      <nav className="text-sm mb-4 text-gray-500">Startseite / Favoriten</nav>
      <h1 className="text-3xl font-bold mb-6 text-center">Meine Favoriten</h1>
      <p className="text-center text-gray-600 mb-8">Gesamt: {favorites.length} Favoriten</p>

      <div className="flex justify-end mb-6">
        <button onClick={goToComparePage} className="text-blue-600 hover:underline">
          Vergleiche {compareList.length} Einträge
        </button>
      </div>

      {/* Rest bleibt unverändert */}
      {/* ... */}
    </div>
  );
};

export default FavoritesPage;
