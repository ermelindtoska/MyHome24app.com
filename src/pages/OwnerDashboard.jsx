import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";

const OwnerDashboard = () => {
  const [user, loading] = useAuthState(auth);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "listings"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error.message);
      }
    };

    if (!loading && user) {
      fetchUserListings();
    }
  }, [user, loading]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h2 className="text-xl font-bold mb-4">📊 Your Listings Overview</h2>
      {loading ? (
        <p>Loading user info...</p>
      ) : !user ? (
        <p>Please log in to view your listings.</p>
      ) : listings.length === 0 ? (
        <p>No listings found for your account.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map(listing => (
            <li key={listing.id} className="p-4 border rounded bg-white shadow">
              <h3 className="text-lg font-bold">{listing.title}</h3>
              <p>{listing.city} – {listing.type} – {listing.purpose}</p>
              <p className="text-gray-700">€{listing.price}</p>
              <img src={listing.imageURL} alt={listing.title} className="mt-2 max-w-xs" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OwnerDashboard;
