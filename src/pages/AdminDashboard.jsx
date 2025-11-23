// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../firebase";
import Breadcrumbs from "../components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import ImageModal from "../components/ImageModal";
import SiteMeta from "../components/SEO/SiteMeta";

const AdminDashboard = () => {
  const { t } = useTranslation("admin");

  const [listings, setListings] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [financeLeads, setFinanceLeads] = useState([]);
  const [modalImages, setModalImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [userRoles, setUserRoles] = useState({});
  const [roleRequests, setRoleRequests] = useState([]);

  const itemsPerPage = 5;
  const storage = getStorage();

  // 🔹 Finance Leads – live nga Firestore
  useEffect(() => {
    const q = query(
      collection(db, "financeLeads"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setFinanceLeads(items);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "listings"));
        const data = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setListings(data);
      } catch (error) {
        console.error("Error loading listings:", error);
      }
    };

    const fetchSupportMessages = async () => {
      try {
        const snapshot = await getDocs(collection(db, "supportMessages"));
        const messages = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setSupportMessages(messages);
      } catch (err) {
        console.error("Error fetching support messages:", err);
      }
    };

    const fetchRoles = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const roles = {};
        usersSnapshot.forEach((docSnap) => {
          roles[docSnap.id] = docSnap.data().role || "user";
        });
        setUserRoles(roles);
      } catch (err) {
        console.error("Error loading roles:", err);
      }
    };

    fetchListings();
    fetchSupportMessages();
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchRoleRequests = async () => {
      try {
        const snapshot = await getDocs(collection(db, "roleUpgradeRequests"));
        const requests = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setRoleRequests(requests);
      } catch (err) {
        console.error("Error fetching role upgrade requests:", err);
      }
    };

    fetchRoleRequests();
  }, []);

  const logActivity = async (action, detail, userId = "admin") => {
    try {
      await addDoc(collection(db, "logs"), {
        action,
        detail,
        userId,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const deletedListing = listings.find((l) => l.id === id);
      await deleteDoc(doc(db, "listings", id));
      setListings((prev) => prev.filter((listing) => listing.id !== id));
      if (deletedListing) {
        await logActivity(
          "Deleted listing",
          deletedListing.title,
          deletedListing.userId
        );
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "listings", id), { status: newStatus });
      const updated = listings.find((l) => l.id === id);
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, status: newStatus } : listing
        )
      );
      if (updated) {
        await logActivity(
          `Changed status to ${newStatus}`,
          updated.title,
          updated.userId
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // 🔹 Finance Leads – ndryshimi i statusit
  const handleFinanceLeadStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "financeLeads", id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setFinanceLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status: newStatus } : lead
        )
      );
      await logActivity(
        "Updated finance lead status",
        `financeLeadId: ${id} → ${newStatus}`
      );
    } catch (err) {
      console.error("Error updating finance lead:", err);
    }
  };

  // Miratimi i kërkesës: vendos rolin sipas targetRole, fshi kërkesën
  const handleApproveRequest = async (requestId, userId, targetRole = "owner") => {
    try {
      await updateDoc(doc(db, "users", userId), { role: targetRole });
      await deleteDoc(doc(db, "roleUpgradeRequests", requestId));
      setRoleRequests((prev) => prev.filter((req) => req.id !== requestId));
      await logActivity("Approved role upgrade", `UserID: ${userId} → ${targetRole}`);
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "roleUpgradeRequests", requestId));
      setRoleRequests((prev) => prev.filter((req) => req.id !== requestId));
      await logActivity("Rejected role upgrade", `RequestID: ${requestId}`);
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const handleViewImages = async (listingId) => {
    try {
      const folderRef = ref(storage, `listings/${listingId}`);
      const result = await listAll(folderRef);
      const urls = await Promise.all(
        result.items.map((itemRef) => getDownloadURL(itemRef))
      );
      setModalImages(urls);
      setShowModal(true);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      await updateDoc(doc(db, "supportMessages", id), { status: "resolved" });
      setSupportMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, status: "resolved" } : msg
        )
      );
      await logActivity("Marked support as resolved", id);
    } catch (err) {
      console.error("Error updating support message status:", err);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const currentListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <SiteMeta
        titleKey="admin.title"
        descKey="admin.desc"
        path="/admin-dashboard"
        noindex
      />

      <h2 className="text-2xl md:text-3xl font-bold mb-4">
        {t("allListings")}
      </h2>

      {/* Listings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-md text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 border">{t("title")}</th>
              <th className="px-4 py-2 border">{t("city")}</th>
              <th className="px-4 py-2 border">{t("type")}</th>
              <th className="px-4 py-2 border">{t("status")}</th>
              <th className="px-4 py-2 border">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {currentListings.map((listing) => (
              <tr
                key={listing.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-2 border">{listing.title}</td>
                <td className="px-4 py-2 border">{listing.city}</td>
                <td className="px-4 py-2 border">{listing.type}</td>
                <td className="px-4 py-2 border">
                  <select
                    className="bg-white dark:bg-gray-800 border p-1"
                    value={listing.status}
                    onChange={(e) =>
                      handleStatusChange(listing.id, e.target.value)
                    }
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="active">{t("active")}</option>
                    <option value="inactive">{t("inactive")}</option>
                  </select>
                </td>
                <td className="px-4 py-2 border flex flex-col space-y-2">
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    {t("delete")}
                  </button>

                  <button
                    onClick={() => handleViewImages(listing.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                  >
                    {t("viewImages")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role upgrade requests */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        {t("roleUpgradeRequests")}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 border">{t("userId")}</th>
              <th className="py-2 px-4 border">{t("fullName")}</th>
              <th className="py-2 px-4 border">{t("email")}</th>
              <th className="py-2 px-4 border">{t("targetRole")}</th>
              <th className="py-2 px-4 border">{t("reason")}</th>
              <th className="py-2 px-4 border">{t("date")}</th>
              <th className="py-2 px-4 border">{t("action")}</th>
            </tr>
          </thead>

          <tbody>
            {roleRequests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-2 px-4 border">{req.userId}</td>
                <td className="py-2 px-4 border">{req.fullName || "–"}</td>
                <td className="py-2 px-4 border">{req.email || "–"}</td>
                <td className="py-2 px-4 border">
                  {req.targetRole || "owner"}
                </td>
                <td className="py-2 px-4 border">{req.reason}</td>
                <td className="py-2 px-4 border">
                  {req.requestedAt?.toDate?.().toLocaleString?.() || "–"}
                </td>
                <td className="py-2 px-4 border flex space-x-2">
                  <button
                    onClick={() =>
                      handleApproveRequest(
                        req.id,
                        req.userId,
                        req.targetRole || "owner"
                      )
                    }
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {t("approve")}
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {t("reject")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Support Messages */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        {t("supportMessages")}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm md:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 border">{t("name")}</th>
              <th className="py-2 px-4 border">{t("email")}</th>
              <th className="py-2 px-4 border">{t("category")}</th>
              <th className="py-2 px-4 border">{t("message")}</th>
              <th className="py-2 px-4 border">{t("date")}</th>
              <th className="py-2 px-4 border">{t("status")}</th>
              <th className="py-2 px-4 border">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {supportMessages.map((msg) => (
              <tr
                key={msg.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-2 px-4 border">{msg.name}</td>
                <td className="py-2 px-4 border">{msg.email}</td>
                <td className="py-2 px-4 border">{msg.category}</td>
                <td className="py-2 px-4 border">{msg.message}</td>
                <td className="py-2 px-4 border">
                  {msg.timestamp?.toDate?.().toLocaleString?.() || "–"}
                </td>
                <td className="py-2 px-4 border">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      msg.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {msg.status || "open"}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  {msg.status !== "resolved" && (
                    <button
                      onClick={() => handleMarkResolved(msg.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {t("markResolved")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Finance Leads */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Finance Leads (Hypotheken-Anfragen)
      </h2>
      {financeLeads.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aktuell liegen keine Finanzierungsanfragen vor.
        </p>
      ) : (
        <div className="space-y-4">
          {financeLeads.map((lead) => (
            <div
              key={lead.id}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* LEFT SIDE */}
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Anfrage vom Hypothekenrechner
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lead.createdAt?.toDate
                    ? lead.createdAt.toDate().toLocaleString()
                    : "Kein Datum"}
                </p>

                <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 space-y-1">
                  <p><strong>Kaufpreis:</strong> {lead.purchasePrice} €</p>
                  <p><strong>Eigenkapital:</strong> {lead.downPayment} €</p>
                  <p><strong>Zinssatz:</strong> {lead.interest} %</p>
                  <p><strong>Laufzeit:</strong> {lead.termYears} Jahre</p>
                  <p><strong>Monatsrate:</strong> {lead.monthlyPayment} €</p>
                  <p><strong>Gesamte Zinskosten:</strong> {lead.totalInterest} €</p>

                  {lead.userId ? (
                    <p className="text-emerald-500">
                      Benutzer-ID: {lead.userId}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Gast-Anfrage
                    </p>
                  )}

                  {lead.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Notizen: {lead.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <select
                  value={lead.status || "open"}
                  onChange={(e) =>
                    handleFinanceLeadStatusChange(lead.id, e.target.value)
                  }
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm rounded-md px-3 py-2"
                >
                  <option value="open">Offen</option>
                  <option value="in_progress">In Bearbeitung</option>
                  <option value="closed">Abgeschlossen</option>
                </select>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Status: {lead.status || "open"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal për imazhet e listing */}
      <ImageModal
        images={modalImages}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;
