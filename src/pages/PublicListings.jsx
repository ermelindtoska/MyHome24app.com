import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const PublicListings = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchPublicListings = async () => {
      const q = query(collection(db, 'listings'), where('isPublic', '==', true));
      const querySnapshot = await getDocs(q);
      const publicListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(publicListings);
    };
    fetchPublicListings();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <Helmet>
        <title>Listings – MyHome24app</title>
      </Helmet>
      <h2 className="text-2xl font-bold mb-4">Available Listings</h2>
      {listings.length === 0 ? (
        <p>No public listings yet.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map(listing => (
            <li key={listing.id} className="border p-4 rounded shadow-sm">
              <Link
                to={`/listing/${listing.id}`}
                className="text-blue-600 hover:underline text-lg font-semibold"
              >
                {listing.title}
              </Link>
              <p>{listing.city} – €{listing.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PublicListings;
