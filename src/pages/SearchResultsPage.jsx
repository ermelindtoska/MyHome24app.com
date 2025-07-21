// src/pages/SearchResultsPage.jsx — FINAL ZUMPER/ZILLOW STYLE + PAGINATION + MAP SHORTCUT MOBILE

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ListingCard from '../components/ListingCard';
import { useTranslation } from 'react-i18next';

const SearchResultsPage = () => {
  const { t } = useTranslation('search');
  const location = useLocation();
  const navigate = useNavigate();
  const queryParam = new URLSearchParams(location.search).get('query') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchAndFilterListings = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'listings'));
        const allListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const q = queryParam.toLowerCase();
        const filtered = allListings.filter(listing => {
          return (
            listing.title?.toLowerCase().includes(q) ||
            listing.city?.toLowerCase().includes(q) ||
            listing.address?.toLowerCase().includes(q) ||
            listing.zipCode?.toLowerCase().includes(q)
          );
        });

        setResults(filtered);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
      setLoading(false);
    };

    if (queryParam) {
      fetchAndFilterListings();
    }
  }, [queryParam]);

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const paginatedResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-4 py-24 relative">
      {/* Mobile Map Fullscreen Shortcut */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <button
          onClick={() => navigate('/map')}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          {t('mapSearch', { ns: 'navbar' })}
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          {t('resultsFor')} "{queryParam}"
        </h1>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('loading')}...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noResults')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedResults.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-4">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {t('previous')}
                </button>

                <span className="text-gray-700 dark:text-gray-300">
                  {t('pageInfo', { current: currentPage, total: totalPages })}
                </span>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {t('next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
