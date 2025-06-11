// ✅ SearchResultsPage.jsx – Gati për kopjim dhe përdorim
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import ListingCard from '../components/ListingCard';
import { useTranslation } from 'react-i18next';

const SearchResultsPage = () => {
  const { t } = useTranslation('search');
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('query');

  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'listings'));
      const allListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allListings.filter(listing => {
        const title = listing.title?.toLowerCase() || '';
        const address = listing.address?.toLowerCase() || '';
        const city = listing.city?.toLowerCase() || '';
        const zip = listing.zipCode?.toLowerCase() || '';
        return (
          title.includes(queryParam.toLowerCase()) ||
          address.includes(queryParam.toLowerCase()) ||
          city.includes(queryParam.toLowerCase()) ||
          zip.includes(queryParam.toLowerCase())
        );
      });
      setResults(filtered);
    };

    if (queryParam) {
      fetchData();
    }
  }, [queryParam]);

  return (
    <div className="py-20 px-4 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          {t('resultsFor')} "{queryParam}"
        </h1>

        {results.length === 0 ? (
          <p className="text-gray-600 text-lg">{t('noResults')}</p>
        ) : (
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
            {results.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
