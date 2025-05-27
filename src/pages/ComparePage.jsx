// src/pages/ComparePage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const ComparePage = () => {
  const location = useLocation();
  const listings = location.state?.listings || [];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Vergleich</h1>

      {listings.length === 0 ? (
        <p className="text-center text-gray-500">Keine Einträge zum Vergleichen gefunden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Titel</th>
                <th className="px-4 py-2 border">Ort</th>
                <th className="px-4 py-2 border">Preis (€)</th>
                <th className="px-4 py-2 border">Ø Bewertung</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{item.title}</td>
                  <td className="px-4 py-2 border">{item.city}</td>
                  <td className="px-4 py-2 border">{item.price}</td>
                  <td className="px-4 py-2 border">{item.avgRating ? `${item.avgRating}★` : '-'}</td>
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
