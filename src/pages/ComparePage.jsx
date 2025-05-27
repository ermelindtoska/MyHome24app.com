// src/pages/ComparePage.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const ComparePage = () => {
  const location = useLocation();
  const [listings, setListings] = useState(location.state?.listings || []);

  const removeListing = (index) => {
    const updated = [...listings];
    updated.splice(index, 1);
    setListings(updated);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPriceColor = (price) => {
    if (price < 100000) return 'text-green-600';
    if (price < 300000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Vergleich</h1>

      {listings.length === 0 ? (
        <p className="text-center text-gray-500">Keine Einträge zum Vergleichen gefunden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Bild</th>
                <th className="px-4 py-2 border">Titel</th>
                <th className="px-4 py-2 border">Ort</th>
                <th className="px-4 py-2 border">Preis</th>
                <th className="px-4 py-2 border">Ø Bewertung</th>
                <th className="px-4 py-2 border">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <img src={item.imageUrl || '/placeholder.jpg'} alt={item.title} className="w-20 h-14 object-cover rounded" />
                  </td>
                  <td className="px-4 py-2 border font-semibold">{item.title}</td>
                  <td className="px-4 py-2 border text-gray-700">{item.city}</td>
                  <td className={`px-4 py-2 border font-medium ${getPriceColor(item.price)}`}>{formatPrice(item.price)}</td>
                  <td className="px-4 py-2 border">{item.avgRating ? `${item.avgRating}★` : '-'}</td>
                  <td className="px-4 py-2 border">
                    <button onClick={() => removeListing(index)} className="text-red-500 hover:underline text-sm">Entfernen</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
