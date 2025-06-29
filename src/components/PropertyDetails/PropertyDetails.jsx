// PropertyDetails.jsx – versioni i plotë si Zillow
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { FaBed, FaBath, FaMapMarkerAlt, FaMoneyBill, FaEnvelope, FaPhone } from 'react-icons/fa';

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation('property');
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty(docSnap.data());
        } else {
          console.error('No such property!');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
      }
    };
    fetchProperty();
  }, [id]);

  if (!property) {
    return <div className="text-center p-10 text-gray-500">{t('loading')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
      <div className="flex items-center text-gray-600 mb-6">
        <FaMapMarkerAlt className="mr-2" />
        <span>{property.address}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {property.images?.map((url, idx) => (
          <img key={idx} src={url} alt={`Property image ${idx}`} className="rounded-lg w-full h-64 object-cover" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2 text-blue-700"><FaBed /> {property.bedrooms} {t('bedrooms')}</div>
        <div className="flex items-center gap-2 text-blue-700"><FaBath /> {property.bathrooms} {t('bathrooms')}</div>
        <div className="flex items-center gap-2 text-blue-700"><FaMoneyBill /> {property.price} €</div>
        <div className="flex items-center gap-2 text-blue-700">{property.size} m²</div>
      </div>
      <p className="text-gray-700 mb-6">{property.description}</p>
      <div className="border-t pt-6 mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('contactAgent')}</h2>
        <div className="flex flex-col gap-2 text-gray-700">
          <div><strong>{t('agent')}:</strong> {property.agent?.name || 'N/A'}</div>
          <div className="flex items-center gap-2"><FaPhone /> {property.agent?.phone || 'N/A'}</div>
          <div className="flex items-center gap-2"><FaEnvelope /> {property.agent?.email || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
