import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPhoneAlt, FaEnvelope, FaCheckCircle, FaInfoCircle,
  FaTag, FaTools, FaBalanceScale, FaHistory
} from 'react-icons/fa';

import SimilarListings from './SimilarListings/SimilarListings';

const FALLBACK_IMG = '/images/hero-1.jpg';

const ListingDetailsModal = ({ listing, onClose, allListings }) => {
  const { t } = useTranslation('listing');
  const safeImages = useMemo(() => {
    const arr =
      listing?.images ||
      listing?.imageUrls ||
      (listing?.image ? [listing.image] : []);
    return (Array.isArray(arr) && arr.length > 0) ? arr : [FALLBACK_IMG];
  }, [listing]);

  const [current, setCurrent] = useState(0);
  const nextImage = () => setCurrent((current + 1) % safeImages.length);
  const prevImage = () => setCurrent((current - 1 + safeImages.length) % safeImages.length);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!listing) return null;

  const typeLabel = listing?.type || '—';
  const typeKey = listing?.type ? listing.type.toLowerCase() : null;
  const priceText = (listing?.price ?? '') !== '' ? `€ ${Number(listing.price).toLocaleString()}` : '—';

  return (
    <AnimatePresence>
      <motion.div
        key="modal"
        className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key="panel"
          className="w-full sm:max-w-md h-full overflow-y-auto p-6 shadow-xl relative border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-5 text-2xl font-bold text-gray-500 hover:text-black dark:hover:text-white transition-all z-50"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          >
            ✖
          </motion.button>

          {/* Slider */}
          <div className="relative mb-4 rounded overflow-hidden group">
            <motion.img
              key={safeImages[current]}
              src={safeImages[current]}
              alt={`slide-${current}`}
              className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
              initial={{ opacity: 0.6, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            />
            {safeImages.length > 1 && (
              <>
                <motion.button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-800/80 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ←
                </motion.button>
                <motion.button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-800/80 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  →
                </motion.button>
              </>
            )}
            <div className="absolute bottom-2 right-3 text-xs text-gray-800 dark:text-gray-200 bg-white/70 dark:bg-gray-800/80 px-2 py-0.5 rounded">
              {current + 1}/{safeImages.length}
            </div>
          </div>
          

          {/* Info */}
          <h2 className="text-2xl font-semibold mb-2 sticky top-0 bg-gradient-to-b from-white to-transparent dark:from-gray-900 py-2 z-10">
            {listing.title || '—'}
          </h2>
          <p className="mb-1"><strong>📍 {t('city')}:</strong> {listing.city} {listing.postalCode ? `(${listing.postalCode})` : ''}</p>
          <p className="mb-1"><strong>💶 {t('price')}:</strong> {priceText}</p>
          <p className="mb-1"><strong>🏠 {t('type')}:</strong> {typeKey ? t(typeKey) : typeLabel}</p>
          <p className="mb-1 flex items-center gap-2">
            <strong>🎯 {t('purpose')}:</strong>
            <span className={`px-2 py-0.5 rounded text-white text-xs ${listing.purpose === 'buy' ? 'bg-green-600' : 'bg-blue-600'}`}>
              {listing.purpose === 'buy' ? t('forSale') : t('forRent')}
            </span>
          </p>
          {listing.bedrooms != null && <p className="mb-1"><strong>🛏️ {t('bedrooms')}:</strong> {listing.bedrooms}</p>}
          {listing.size != null && <p className="mb-1"><strong>📐 {t('size')}:</strong> {listing.size} m²</p>}

          {listing.description && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded shadow-inner">
              <p className="whitespace-pre-line leading-relaxed text-[15px] text-gray-800 dark:text-gray-200">
                {listing.description}
              </p>
            </div>
          )}

          {/* Badges */}
          {(listing.isFeatured || listing.isHighlighted || listing.isUrgent || listing.isLuxury || listing.isPriceReduced) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {listing.isFeatured && <span className="inline-block bg-yellow-400 text-yellow-900 px-2 py-0.5 text-xs rounded">{t('featured')}</span>}
              {listing.isHighlighted && <span className="inline-block bg-purple-400 text-purple-900 px-2 py-0.5 text-xs rounded">{t('highlighted')}</span>}
              {listing.isUrgent && <span className="inline-block bg-red-500 text-white px-2 py-0.5 text-xs rounded">{t('urgent')}</span>}
              {listing.isLuxury && <span className="inline-block bg-indigo-500 text-white px-2 py-0.5 text-xs rounded">{t('luxury')}</span>}
              {listing.isPriceReduced && <span className="inline-block bg-blue-500 text-white px-2 py-0.5 text-xs rounded">{t('priceReduced')}</span>}
            </div>
          )}

          {/* Overview */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" /> {t('overview')}
            </h3>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              {listing.builtYear && <li><strong>{t('builtYear')}:</strong> {listing.builtYear}</li>}
              {listing.floor && <li><strong>{t('floor')}:</strong> {listing.floor}</li>}
              {listing.totalFloors && <li><strong>{t('totalFloors')}:</strong> {listing.totalFloors}</li>}
              {listing.energyClass && <li><strong>{t('energyClass')}:</strong> {listing.energyClass}</li>}
              {listing.condition && <li><strong>{t('condition')}:</strong> {listing.condition}</li>}
              {listing.availabilityDate && <li><strong>{t('availabilityDate')}:</strong> {listing.availabilityDate}</li>}
            </ul>
          </div>

          {/* Status */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FaTag className="text-yellow-600" /> {t('status')}
            </h3>
            <ul className="text-gray-700 space-y-1">
              {listing.status && <li><strong>{t('status')}:</strong> {listing.status}</li>}
              {listing.isFeatured && <li><FaCheckCircle className="inline text-green-500 mr-1" /> {t('featured')}</li>}
              {listing.isHighlighted && <li><FaCheckCircle className="inline text-green-500 mr-1" /> {t('highlighted')}</li>}
              {listing.isUrgent && <li><FaCheckCircle className="inline text-red-500 mr-1" /> {t('urgent')}</li>}
              {listing.isLuxury && <li><FaCheckCircle className="inline text-yellow-500 mr-1" /> {t('luxury')}</li>}
              {listing.isPriceReduced && <li><FaCheckCircle className="inline text-blue-500 mr-1" /> {t('priceReduced')}</li>}
            </ul>
          </div>

          {/* Amenities */}
          {(listing.balcony || listing.elevator || listing.garden || listing.parking || listing.coolingType || listing.heatingType) && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FaTools className="text-green-600" /> {t('amenities')}
              </h3>
              <ul className="text-gray-700 space-y-1">
                {listing.balcony && <li><FaCheckCircle className="inline text-green-500 mr-1" /> {t('balcony')}</li>}
                {listing.elevator && <li><FaCheckCircle className="inline text-green-500 mr-1" /> {t('elevator')}</li>}
                {listing.garden && <li><FaCheckCircle className="inline text-green-500 mr-1" /> {t('garden')}</li>}
                {listing.parking && <li><FaCheckCircle className="inline text-green-500 mr-1" /> {t('parking')}</li>}
                {listing.coolingType && <li><strong>{t('coolingType')}:</strong> {listing.coolingType}</li>}
                {listing.heatingType && <li><strong>{t('heatingType')}:</strong> {listing.heatingType}</li>}
              </ul>
            </div>
          )}

          {/* Legal */}
          {(listing.ownership || listing.legalStatus || listing.taxInfo || listing.utilitiesIncluded) && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FaBalanceScale className="text-purple-600" /> {t('legalStatus')}
              </h3>
              <ul className="text-gray-700 space-y-1">
                {listing.ownership && <li><strong>{t('ownership')}:</strong> {listing.ownership}</li>}
                {listing.legalStatus && <li><strong>{t('legalStatus')}:</strong> {listing.legalStatus}</li>}
                {listing.taxInfo && <li><strong>{t('taxInfo')}:</strong> {listing.taxInfo}</li>}
                {listing.utilitiesIncluded && <li>{t('utilitiesIncluded')}</li>}
              </ul>
            </div>
          )}

          {/* History */}
          {Array.isArray(listing.history) && listing.history.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FaHistory className="text-gray-600" /> {t('propertyHistory')}
              </h3>
              <ul className="text-gray-700 space-y-1">
                {listing.history.map((entry, idx) => (
                  <li key={idx}><strong>{entry.date}</strong>: {entry.event}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 border-t pt-4">
  <h3 className="text-lg font-semibold mb-2">{t('similarListings')}</h3>
  <SimilarListings
    currentListing={listing}
    allListings={allListings}
    limit={6}
    onPick={() => {
      // mbyll modalin pastaj le navigimin e SimilarListings
      onClose();
      // opsionale: rikthe scroll te fillimi
      setTimeout(() => window.scrollTo(0, 0), 250);
    }}
  />
</div>

          {/* Agent */}
          {listing.agent && (
            <div className="mt-6 border-t pt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded shadow-inner">
              <h3 className="text-xl font-semibold mb-2">{t('contactAgent')}</h3>
              <p><strong>{t('agentName')}:</strong> {listing.agent.name}</p>
              {listing.agent.phone && (<p className="flex items-center gap-2"><FaPhoneAlt className="text-blue-600" /> {listing.agent.phone}</p>)}
              {listing.agent.email && (<p className="flex items-center gap-2 mb-3"><FaEnvelope className="text-blue-600" /> {listing.agent.email}</p>)}
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                  {t('contactAgent')}
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                  {t('scheduleVisit')}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListingDetailsModal;
