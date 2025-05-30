// pages/ListingsPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import ListingCard from '../components/ListingCard';

const ListingsPage = () => {
  const { t } = useTranslation('listing');
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(data);
    };

    fetchListings();
  }, []);

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Të gjitha shpalljet</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.length > 0 ? (
          listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500"><Leer></Leer>.</p>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;
