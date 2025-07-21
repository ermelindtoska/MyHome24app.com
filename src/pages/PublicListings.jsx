// src/pages/PublicListings.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import ListingCard from '../components/ListingCard';

const PublicListings = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(data);
    };
    fetchListings();
  }, []);

  const filtered = listings.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = city ? item.city?.toLowerCase().includes(city.toLowerCase()) : true;
    const matchesType = type ? item.type === type : true;
    const matchesMin = minPrice ? item.price >= parseFloat(minPrice) : true;
    const matchesMax = maxPrice ? item.price <= parseFloat(maxPrice) : true;
    return matchesSearch && matchesCity && matchesType && matchesMin && matchesMax;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Alle Immobilien</h1>

      {/* Filterleiste */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <input
          type="text"
          placeholder="Suche nach Titel"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Stadt"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Typ wählen</option>
          <option value="apartment">Wohnung</option>
          <option value="house">Haus</option>
        </select>
        <input
          type="number"
          placeholder="Min €"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Max €"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {/* Listendarstellung */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filtered.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Interaktive Karte */}
      <div className="h-[500px] w-full border rounded overflow-hidden">
        <iframe
          title="Immobilienkarte"
          width="100%"
          height="100%"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Deutschland"
        ></iframe>
      </div>
    </div>
  );
};

export default PublicListings;
