import React from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import AddListingForm from '../components/AddListingForm';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const AddListingPage = () => {
  const { t } = useTranslation();

  const handleAddListing = async (listing) => {
    if (!auth.currentUser) {
      toast.error(t('listing.loginRequired'));
      return;
    }

    try {
      await addDoc(collection(db, 'listings'), {
        ...listing,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      toast.success(t('listing.success'));
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error(t('listing.error'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('listing.createTitle')}</h1>
      <AddListingForm onSubmit={handleAddListing} />
    </div>
  );
};

export default AddListingPage;
