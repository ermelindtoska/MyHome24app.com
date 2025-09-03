import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getDocs, collection, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from 'react-i18next';
import ImageModal from '../components/ImageModal';

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
  const [roleRequests, setRoleRequests] = useState([]);

useEffect(() => {
  const fetchListings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'listings'));
      const data = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      console.log('Listings:', data); // ➤ Shto këtë
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
  const fetchRoleRequests = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'roleUpgradeRequests'));
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setRoleRequests(requests);
  } catch (err) {
    console.error("Error fetching role upgrade requests:", err);
  }
};
fetchRoleRequests();


  const logActivity = async (action, detail, userId = 'admin') => {
    try {
      await addDoc(collection(db, 'logs'), {
        action,
        detail,
        userId,
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
      await logActivity('Deleted listing', deletedListing.title, deletedListing.userId);
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
      await logActivity(`Changed status to ${newStatus}`, updated.title, updated.userId);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  const handleApproveRequest = async (requestId, userId) => {
  try {
    await updateDoc(doc(db, 'roles', userId), { role: 'owner' });
    await deleteDoc(doc(db, 'roleUpgradeRequests', requestId));
    setRoleRequests(prev => prev.filter(req => req.id !== requestId));
    await logActivity('Approved owner upgrade', `UserID: ${userId}`);
  } catch (err) {
    console.error("Error approving request:", err);
  }
};

const handleRejectRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, 'roleUpgradeRequests', requestId));
    setRoleRequests(prev => prev.filter(req => req.id !== requestId));
    await logActivity('Rejected owner upgrade', `RequestID: ${requestId}`);
  } catch (err) {
    console.error("Error rejecting request:", err);
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
      await logActivity('Marked support as resolved', id);
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
  const currentListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Helmet>
        <title>Admin Dashboard – MyHome24app</title>
        <meta name="description" content="Overview of all real estate listings and admin control for MyHome24app" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('allListings')}</h2>

      {/* Listings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-md text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 border">{t('title')}</th>
              <th className="px-4 py-2 border">{t('city')}</th>
              <th className="px-4 py-2 border">{t('type')}</th>
              <th className="px-4 py-2 border">{t('status')}</th>
              <th className="px-4 py-2 border">{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {currentListings.map(listing => (
              <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2 border">{listing.title}</td>
                <td className="px-4 py-2 border">{listing.city}</td>
                <td className="px-4 py-2 border">{listing.type}</td>
                <td className="px-4 py-2 border">
                  <select
                    className="bg-white dark:bg-gray-800 border p-1"
                    value={listing.status}
                    onChange={e => handleStatusChange(listing.id, e.target.value)}
                  >
                    <option value="pending">{t('pending')}</option>
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                  </select>
                </td>
                <td className="px-4 py-2 border flex flex-col space-y-2">
                  <button onClick={() => handleDelete(listing.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">
                    {t('delete')}
                  </button>
                  <button onClick={() => handleViewImages(listing.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                    {t('viewImages')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="text-xl font-semibold mt-10 mb-4">{t('roleUpgradeRequests')}</h2>
<div className="overflow-x-auto">
  <table className="min-w-full border text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    <thead>
      <tr className="bg-gray-100 dark:bg-gray-700">
        <th className="py-2 px-4 border">{t('userId')}</th>
        <th className="py-2 px-4 border">{t('reason')}</th>
        <th className="py-2 px-4 border">{t('date')}</th>
        <th className="py-2 px-4 border">{t('action')}</th>
      </tr>
    </thead>
    <tbody>
      {roleRequests.map(req => (
        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td className="py-2 px-4 border">{req.userId}</td>
          <td className="py-2 px-4 border">{req.reason}</td>
          <td className="py-2 px-4 border">
            {req.timestamp?.toDate?.().toLocaleString?.() || '–'}
          </td>
          <td className="py-2 px-4 border flex space-x-2">
            <button
              onClick={() => handleApproveRequest(req.id, req.userId)}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {t('approve')}
            </button>
            <button
              onClick={() => handleRejectRequest(req.id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t('reject')}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {/* Support Messages Table */}
      <h2 className="text-xl font-semibold mt-10 mb-4">{t('supportMessages')}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 border">{t('name')}</th>
              <th className="py-2 px-4 border">{t('email')}</th>
              <th className="py-2 px-4 border">{t('category')}</th>
              <th className="py-2 px-4 border">{t('message')}</th>
              <th className="py-2 px-4 border">{t('date')}</th>
              <th className="py-2 px-4 border">{t('status')}</th>
              <th className="py-2 px-4 border">{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {supportMessages.map(msg => (
              <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                      {t('markResolved')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ImageModal images={modalImages}isOpen={showModal} onClose={() => setShowModal(false)}/>
      </div>
    </div>
  );
};

export default AdminDashboard;
