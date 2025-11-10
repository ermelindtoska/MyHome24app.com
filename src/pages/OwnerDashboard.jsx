// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";

export default function OwnerDashboard() {
  const navigate = useNavigate();

  // ✅ Përdor njëherësh të gjitha namespace-ët që i përdor në këtë faqe
  const { t } = useTranslation(["userDashboard", "listing", "filterBar", "dashboard"]);

  // Helper i vogël që provon në disa namespace (nëse te duhet)
  const tt = (key, opt = {}) =>
    t(key, { ns: ["userDashboard", "listing", "filterBar", "dashboard"], ...opt });

  const [user, loading] = useAuthState(auth);
  const [listings, setListings] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      try {
        const qy = query(collection(db, "listings"), where("userId", "==", user.uid));
        const snapshot = await getDocs(qy);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    })();
  }, [user, loading]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "listings", id));
      setListings((prev) => prev.filter((x) => x.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const openDetails = (listing) => setSelectedListing(listing);
  const closeDetails = () => setSelectedListing(null);

  // ✅ Klikueshmëri për kartat (CTA)
  const goAddProperty = () => navigate("/add-property");
  const goManageRentals = () => navigate("/manage/properties");
  const goViewRequests = () => navigate("/support"); // mund ta ndryshosh më vonë te faqja jote e kërkesave

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-0">
              {tt("owner_dashboard_title", { defaultValue: "Owner-Dashboard" })}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {tt("owner_dashboard_welcome", { defaultValue: "Willkommen zurück!" })}
            </p>
          </div>

          <button
            onClick={goAddProperty}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mt-4 md:mt-0"
          >
            ➕ {tt("add_property", { defaultValue: "Anzeige hinzufügen" })}
          </button>
        </div>

        {/* Stats – bëji klikueshme për të shkuar në veprimin përkatës */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <button
            onClick={() => navigate("/owner-dashboard")}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 className="text-xl font-semibold mb-2">{tt("total_properties", { defaultValue: "Gesamtanzahl" })}</h2>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{listings.length}</p>
          </button>

          <button
            onClick={goManageRentals}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <h2 className="text-xl font-semibold mb-2">{tt("active_rentals", { defaultValue: "Aktiv" })}</h2>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">2</p>
          </button>

          <button
            onClick={goViewRequests}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-left focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <h2 className="text-xl font-semibold mb-2">{tt("pending_requests", { defaultValue: "Anfragen" })}</h2>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">1</p>
          </button>

          <button
            onClick={() => navigate("/support")}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-left focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <h2 className="text-xl font-semibold mb-2">{tt("support_tickets", { defaultValue: "Tickets" })}</h2>
            <p className="text-3xl font-bold text-red-500 dark:text-red-400">0</p>
          </button>
        </div>

        {/* Quick Actions – të gjitha klikueshme */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{tt("quick_actions", { defaultValue: "Schnellaktionen" })}</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={goAddProperty} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              {tt("add_property", { defaultValue: "Anzeige hinzufügen" })}
            </button>
            <button onClick={goViewRequests} className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded">
              {tt("view_requests", { defaultValue: "Anfragen ansehen" })}
            </button>
            <button onClick={goManageRentals} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded">
              {tt("manage_rentals", { defaultValue: "Vermietungen verwalten" })}
            </button>
          </div>
        </div>

        {/* User Listings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">{tt("your_properties", { defaultValue: "Deine Anzeigen" })}</h2>
          {listings.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">{tt("no_properties", { defaultValue: "Keine Anzeigen vorhanden." })}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left">{tt("title", { defaultValue: "Titel" })}</th>
                    <th className="px-4 py-2 text-left">{tt("city", { defaultValue: "Stadt" })}</th>
                    <th className="px-4 py-2 text-left">{tt("price", { defaultValue: "Preis" })}</th>
                    <th className="px-4 py-2 text-left">{tt("actions", { defaultValue: "Aktionen" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{listing.title}</td>
                      <td className="px-4 py-2">{listing.city}</td>
                      <td className="px-4 py-2">{listing.price} €</td>
                      <td className="px-4 py-2 flex flex-wrap gap-2 items-center">
                        <button
                          onClick={() => openDetails(listing)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                          title={tt("view", { defaultValue: "Ansehen" })}
                        >
                          <FaEye />
                        </button>
                        <Link to={`/edit-listing/${listing.id}`} title={tt("edit", { defaultValue: "Bearbeiten" })}>
                          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                            <FaEdit />
                          </button>
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(listing.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          title={tt("delete", { defaultValue: "Löschen" })}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal – Detaje */}
        {selectedListing && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <button onClick={closeDetails} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl">
                ✖
              </button>
              {selectedListing.imageUrl && (
                <img
                  src={selectedListing.imageUrl}
                  alt={selectedListing.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{selectedListing.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                <strong>{tt("city", { defaultValue: "Stadt" })}:</strong> {selectedListing.city}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                <strong>{tt("price", { defaultValue: "Preis" })}:</strong> {selectedListing.price} €
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                <strong>{tt("type", { defaultValue: "Typ" })}:</strong>{" "}
                {tt(selectedListing.type?.toLowerCase() || "", { defaultValue: selectedListing.type || "-" })}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                <strong>{tt("purpose", { defaultValue: "Zweck" })}:</strong>{" "}
                {tt(selectedListing.purpose?.toLowerCase() || "", { defaultValue: selectedListing.purpose || "-" })}
              </p>
              {selectedListing.description && (
                <p className="text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-wrap">
                  {selectedListing.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg text-center">
              <h2 className="text-lg font-semibold mb-4">
                {tt("confirm_delete_title", { defaultValue: "Wirklich löschen?" })}
              </h2>
              <p className="mb-6">{tt("confirm_delete_message", { defaultValue: "Diese Anzeige wird dauerhaft gelöscht." })}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  {tt("yes_delete", { defaultValue: "Ja, löschen" })}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  {tt("cancel", { defaultValue: "Abbrechen" })}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
