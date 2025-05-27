// src/pages/AddListingPage.jsx
import React from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import AddListingForm from '../components/AddListingForm';

const AddListingPage = () => {
  const handleAddListing = async (listing) => {
    try {
      await addDoc(collection(db, 'listings'), {
        ...listing,
        userId: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
      });
      alert('Anzeige erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Beim Speichern ist ein Fehler aufgetreten.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Neue Anzeige erstellen</h1>
      <AddListingForm onSubmit={handleAddListing} />
    </div>
  );
};

export default AddListingPage;
