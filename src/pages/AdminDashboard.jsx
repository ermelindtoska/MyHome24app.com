// AdminDashboard.jsx (me mbështetje për mesazhe supporti të kategorizuara dhe "Mark as Resolved")
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getDocs, collection, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase-config';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation('admin');
  const [listings, setListings] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
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
        setListings(data);
      } catch (error) {
        console.error('Error loading listings:', error);
      }
    };

    const fetchSupportMessages = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'supportMessages'));
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSupportMessages(messages);
      } catch (err) {
        console.error("Error fetching support messages:", err);
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
    fetchSupportMessages();
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

  const handleMarkResolved = async (id) => {
    try {
      await updateDoc(doc(db, 'supportMessages', id), { status: 'resolved' });
      setSupportMessages(prev =>
        prev.map(msg => msg.id === id ? { ...msg, status: 'resolved' } : msg)
      );
    } catch (err) {
      console.error("Error updating support message status:", err);
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
      <h2 className="text-2xl font-bold mb-4">All Listings (Admin)</h2>

      {/* Listings Section */}
      {/* ... mbetet i pandryshuar ... */}

      {/* Support Messages Section */}
      <h2 className="text-xl font-semibold mt-12 mb-4">Support Messages</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Message</th>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {supportMessages.map(msg => (
              <tr key={msg.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{msg.name}</td>
                <td className="py-2 px-4 border">{msg.email}</td>
                <td className="py-2 px-4 border">{msg.category}</td>
                <td className="py-2 px-4 border">{msg.message}</td>
                <td className="py-2 px-4 border">{msg.timestamp?.toDate?.().toLocaleString?.() || '–'}</td>
                <td className="py-2 px-4 border">
                  <span className={`px-2 py-1 text-xs rounded ${msg.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {msg.status || 'open'}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  {msg.status !== 'resolved' && (
                    <button
                      onClick={() => handleMarkResolved(msg.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
