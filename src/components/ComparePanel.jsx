import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ComparePanel = ({ selectedListings }) => {
  const { t } = useTranslation('compare');

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }} 
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-lg z-[999] p-4 overflow-y-auto"
    >
      <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
      {selectedListings.length === 0 ? (
        <p className="text-gray-500">{t('noSelection')}</p>
      ) : (
        <ul className="space-y-2">
          {selectedListings.map((listing, idx) => (
            <li key={idx} className="border p-2 rounded hover:bg-gray-100">
              {listing.title}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default ComparePanel;
