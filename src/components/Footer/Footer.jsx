import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTranslation } from 'react-i18next';

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation('property');
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Fehler beim Laden der Immobilie:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <p className="text-center mt-10">{t('loading')}</p>;
  if (!property) return <p className="text-center mt-10">{t('notFound')}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-4">{property.title}</h1>
      <p className="text-lg text-gray-600 mb-6">{property.description}</p>
      {property.imageUrls && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {property.imageUrls.map((url, i) => (
            <img key={i} src={url} alt={`Image ${i + 1}`} className="rounded shadow-md" />
          ))}
        </div>
      )}
      <div className="bg-gray-100 p-6 rounded shadow">
        <p><strong>{t('price')}:</strong> €{property.price}</p>
        <p><strong>{t('location')}:</strong> {property.location}</p>
        <p><strong>{t('bedrooms')}:</strong> {property.bedrooms}</p>
        <p><strong>{t('bathrooms')}:</strong> {property.bathrooms}</p>
        <p><strong>{t('area')}:</strong> {property.area} m²</p>
      </div>
    </div>
  );
};

export default PropertyDetails;