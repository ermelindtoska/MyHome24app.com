// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import ListingCards from '../components/ListingCards';

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    const allListings = JSON.parse(localStorage.getItem('listings')) || [];
    const mine = allListings.filter((listing) => listing.owner === user?.email);
    setMyListings(mine);
  }, [user]);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Paneli im – {user?.email}</h1>

      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Shpalljet e mia</h2>
        {myListings.length > 0 ? (
          <ListingCards listings={myListings} />
        ) : (
          <p>Ju ende nuk keni shpallje të ruajtura.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
