import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getDocs, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase-config';

const AdminDashboard = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalImages, setModalImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userRoles, setUserRoles] = useState({});
  const itemsPerPage = 5;
  const storage = getStorage();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'listings'));
        const data = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setListings(data);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      }
    };

    const fetchRoles = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const roles = {};
        usersSnapshot.forEach(doc => {
          roles[doc.id] = doc.data().role || 'user';
        });
        setUserRoles(roles);
      } catch (err) {
        console.error('Fehler beim Laden der Benutzerrollen:', err);
      }
    };

    fetchListings();
    fetchRoles();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'listings', id));
      setListings(prev => prev.filter(listing => listing.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen der Anzeige:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'listings', id), { status: newStatus });
      setListings(prev =>
        prev.map(listing =>
          listing.id === id ? { ...listing, status: newStatus } : listing
        )
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Status:', error);
    }
  };

  const handleViewImages = async (listingId) => {
    try {
      const folderRef = ref(storage, `listings/${listingId}`);
      const result = await listAll(folderRef);
      const urls = await Promise.all(result.items.map(itemRef => getDownloadURL(itemRef)));
      setModalImages(urls);
      setShowModal(true);
    } catch (error) {
      console.error('Fehler beim Laden der Bilder:', error);
    }
  };

  const exportToCSV = () => {
    const csvHeader = 'Titel,Stadt,Preis (€),Typ,Zweck,Status,Benutzerrolle\n';
    const csvRows = listings.map(listing => {
      const role = userRoles[listing.userId] || 'unbekannt';
      return `${listing.title},${listing.city},${listing.price},${listing.type},${listing.purpose},${listing.status},${role}`;
    });
    const csvContent = csvHeader + csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'listings_backup.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = filteredListings.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Helmet>
        <title>Admin Dashboard – MyHome24app</title>
      </Helmet>
      <h2 className="text-2xl font-bold mb-4">Alle Anzeigen (Admin)</h2>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Suche nach Titel, Stadt oder Typ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Exportieren als CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Titel</th>
              <th className="py-2 px-4 border">Stadt</th>
              <th className="py-2 px-4 border">Preis (€)</th>
              <th className="py-2 px-4 border">Typ</th>
              <th className="py-2 px-4 border">Zweck</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Rolle</th>
              <th className="py-2 px-4 border">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {currentListings.map(listing => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{listing.title}</td>
                <td className="py-2 px-4 border">{listing.city}</td>
                <td className="py-2 px-4 border">{listing.price}</td>
                <td className="py-2 px-4 border">{listing.type}</td>
                <td className="py-2 px-4 border">{listing.purpose}</td>
                <td className="py-2 px-4 border">
                  <select
                    value={listing.status || 'Aktiv'}
                    onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                    <option value="Archiviert">Archiviert</option>
                  </select>
                </td>
                <td className="py-2 px-4 border">{userRoles[listing.userId] || 'Unbekannt'}</td>
                <td className="py-2 px-4 border space-x-2">
                  <button onClick={() => handleViewImages(listing.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Bilder</button>
                  <button onClick={() => handleDelete(listing.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-4 max-w-3xl w-full max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-red-600 text-lg font-bold"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">Bilder zur Anzeige</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {modalImages.map((url, index) => (
                <img key={index} src={url} alt="listing" className="w-full h-48 object-cover rounded" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
