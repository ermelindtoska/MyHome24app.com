import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase-config';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState([]);
  const [favoriteListings, setFavoriteListings] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const favIds = userData.favorites || [];
        setFavorites(favIds);

        const listingsSnapshot = await getDocs(collection(db, 'listings'));
        const listings = listingsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(listing => favIds.includes(listing.id));

        setFavoriteListings(listings);
      }
    };

    fetchFavorites();
  }, [user]);

  if (!user) {
    return <div className="text-center mt-10">Please log in to see your favorites.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Your Favorite Listings</h2>
      {favoriteListings.length === 0 ? (
        <p>You have no favorite listings yet.</p>
      ) : (
        <ul className="space-y-4">
          {favoriteListings.map(listing => (
            <li key={listing.id} className="border p-4 rounded shadow">
              <h3 className="text-xl font-semibold">{listing.title}</h3>
              <p>{listing.city} – €{listing.price}</p>
              <p>Type: {listing.type} | Purpose: {listing.purpose}</p>
              <Link to={`/listing/${listing.id}`} className="text-blue-600 underline">
                View Details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesPage;
