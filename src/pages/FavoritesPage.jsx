// src/pages/FavoritesPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { Link } from 'react-router-dom';
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
        <Link to="/compare" className="text-blue-600 hover:underline">
          Vergleiche {compareList.length} Einträge
        </Link>
      </div>

      <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-10">
        {favorites.map(listing => (
          <div key={listing.id} className="border rounded-lg p-6 bg-white shadow relative">
            <Slider {...sliderSettings}>
              {(listing.imageUrls || ['/placeholder.jpg']).map((url, idx) => (
                <img key={idx} src={url} className="w-full h-48 object-cover rounded" />
              ))}
            </Slider>
            <h2 className="text-xl font-bold mt-4">{listing.title}</h2>
            <p className="text-gray-500">{listing.city}</p>
            <p className="text-blue-600 font-bold">{listing.price} €</p>
            <p className="text-sm text-gray-400">Veröffentlicht: {listing.createdAt?.toDate().toLocaleDateString('de-DE')}</p>
            {averageRating(comments[listing.id]) && (
              <p className="text-sm text-yellow-600">Ø Bewertung: {averageRating(comments[listing.id])}★</p>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setModalContent(listing.contact || 'nicht verfügbar')} className="text-sm bg-blue-600 text-white px-4 py-1 rounded">Kontaktieren</button>
              <button onClick={() => setDetailModal(listing)} className="text-sm border px-4 py-1 rounded">Details</button>
              <button onClick={() => toggleCompare(listing.id)} className="text-sm border px-4 py-1 rounded">{compareList.includes(listing.id) ? 'Entfernen' : 'Vergleichen'}</button>
              <a href={`https://wa.me/?text=Ich%20interessiere%20mich%20für%20${encodeURIComponent(listing.title)}`} target="_blank" rel="noopener noreferrer" className="text-sm underline text-green-600 ml-auto">Teilen</a>
            </div>
          </div>
        ))}
      </div>

      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-xl font-bold mb-4">Kontakt</h3>
            <p className="mb-4">{modalContent}</p>
            <button onClick={() => setModalContent(null)} className="bg-red-500 text-white px-4 py-2 rounded">Schließen</button>
          </div>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">{detailModal.title}</h2>
            <p className="text-gray-600">{detailModal.city}</p>
            <p className="text-blue-600 font-bold">{detailModal.price} €</p>
            <Slider {...sliderSettings}>
              {(detailModal.imageUrls || ['/placeholder.jpg']).map((url, idx) => (
                <img key={idx} src={url} className="w-full h-64 object-cover rounded my-2" />
              ))}
            </Slider>
            <button onClick={() => setDetailModal(null)} className="mt-4 bg-gray-800 text-white px-4 py-2 rounded">Schließen</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
