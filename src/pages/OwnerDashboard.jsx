import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, } from "firebase/firestore";
import { db, auth } from '../firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";



function OwnerDashboard() {
  const { t } = useTranslation("dashboard");
  const [user, loading] = useAuthState(auth);
  const [listings, setListings] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (loading || !user) return;

    const fetchUserListings = async () => {
      try {
        const q = query(collection(db, "listings"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error.message);
      }
    };

    fetchUserListings();
  }, [user, loading]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "listings", id));
      setListings(prev => prev.filter(item => item.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting listing:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-0">
              {t("owner_dashboard_title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("owner_dashboard_welcome")}
            </p>
          </div>

          <Link to="/add-property">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mt-4 md:mt-0">
              ➕ {t("add_property")}
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-2">{t("total_properties")}</h2>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {listings.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-2">{t("active_rentals")}</h2>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">2</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-2">{t("pending_requests")}</h2>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">1</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-2">{t("support_tickets")}</h2>
            <p className="text-3xl font-bold text-red-500 dark:text-red-400">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("quick_actions")}</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/add-property">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                {t("add_property")}
              </button>
            </Link>
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded">
              {t("view_requests")}
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded">
              {t("manage_rentals")}
            </button>
          </div>
        </div>

        {/* User Listings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">{t("your_properties")}</h2>
          {listings.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">{t("no_properties")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left">{t("title")}</th>
                    <th className="px-4 py-2 text-left">{t("city")}</th>
                    <th className="px-4 py-2 text-left">{t("price")}</th>
                    <th className="px-4 py-2 text-left">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(listing => (
                    <tr key={listing.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{listing.title}</td>
                      <td className="px-4 py-2">{listing.city}</td>
                      <td className="px-4 py-2">{listing.price} €</td>
                      <td className="px-4 py-2 space-x-2">
                        <Link to={`/edit-listing/${listing.id}`}>
                          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                            {t("edit")}
                          </button>
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(listing.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          {t("delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg text-center">
              <h2 className="text-lg font-semibold mb-4">{t("confirm_delete_title")}</h2>
              <p className="mb-6">{t("confirm_delete_message")}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  {t("yes_delete")}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;
