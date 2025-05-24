import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase-config';

const db = getFirestore();
const storage = getStorage();

const UserDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'listings'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(userListings);
      setLoading(false);
    };

    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'listings', id));
    setListings(prev => prev.filter(item => item.id !== id));
  };

  const handleViewImages = async (listingId) => {
    const folderRef = ref(storage, `listings/${listingId}`);
    const result = await listAll(folderRef);
    const urls = await Promise.all(result.items.map(itemRef => getDownloadURL(itemRef)));
    setImages(urls);
    setSelectedListing(listings.find(listing => listing.id === listingId));
  };

  if (loading) return <p>Lädt...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Meine Anzeigen</h2>
      {listings.length === 0 ? (
        <p>Keine Anzeigen gefunden.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map(listing => (
            <li key={listing.id} className="p-4 border rounded shadow">
              <h3 className="text-lg font-semibold">{listing.title}</h3>
              <p>{listing.city} – {listing.price} €</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Löschen
                </button>
                <button
                  onClick={() => handleViewImages(listing.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-red-500 text-lg font-bold"
              onClick={() => setSelectedListing(null)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-2">{selectedListing.title}</h3>
            <p className="mb-2">{selectedListing.city} – {selectedListing.price} €</p>
            <div className="grid grid-cols-2 gap-2">
              {images.map((url, idx) => (
                <img key={idx} src={url} alt="Listing" className="w-full h-48 object-cover rounded" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
