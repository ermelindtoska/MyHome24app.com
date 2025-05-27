import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getDocs, collection, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase-config';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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
        console.log("[Debug] Retrieved listings:", data);
        setListings(data);
      } catch (error) {
        console.error('Error loading listings:', error);
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
        console.error('Error loading roles:', err);
      }
    };

    fetchListings();
    fetchRoles();
  }, []);

  const logActivity = async (action, listing) => {
    try {
      await addDoc(collection(db, 'logs'), {
        action,
        title: listing.title,
        userId: listing.userId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const deletedListing = listings.find(l => l.id === id);
      await deleteDoc(doc(db, 'listings', id));
      setListings(prev => prev.filter(listing => listing.id !== id));
      await logActivity('deleted listing', deletedListing);
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'listings', id), { status: newStatus });
      const updated = listings.find(l => l.id === id);
      setListings(prev =>
        prev.map(listing =>
          listing.id === id ? { ...listing, status: newStatus } : listing
        )
      );
      await logActivity(`changed status to ${newStatus}`, updated);
    } catch (error) {
      console.error('Error updating status:', error);
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
      console.error('Error loading images:', error);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch =
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = filteredListings.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Helmet>
        <title>Admin Dashboard – MyHome24app</title>
        <meta name="description" content="Overview of all real estate listings and admin control for MyHome24app" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Breadcrumbs />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">All Listings (Admin)</h2>
        <div className="flex gap-4">
          <Link to="/register" className="text-blue-600 hover:underline">Create Account</Link>
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by title, city, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded w-full md:w-1/4"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Title</th>
              <th className="py-2 px-4 border">City</th>
              <th className="py-2 px-4 border">Price (€)</th>
              <th className="py-2 px-4 border">Type</th>
              <th className="py-2 px-4 border">Purpose</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Role</th>
              <th className="py-2 px-4 border">Actions</th>
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
                    value={listing.status || 'Active'}
                    onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </td>
                <td className="py-2 px-4 border">{userRoles[listing.userId] || 'Unknown'}</td>
                <td className="py-2 px-4 border space-x-2">
                  <button onClick={() => handleViewImages(listing.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Images</button>
                  <button onClick={() => handleDelete(listing.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
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
            <h3 className="text-xl font-bold mb-4">Images for Listing</h3>
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
