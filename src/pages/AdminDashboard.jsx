// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getDocs,
  getDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { db } from "../firebase";
import { useTranslation } from "react-i18next";
import ImageModal from "../components/ImageModal";
import SiteMeta from "../components/SEO/SiteMeta";
import ActivityLogs from "../components/ActivityLogs";
import { logEvent } from "../utils/logEvent";
import ActivityLogTable from "../components/admin/ActivityLogTable";


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
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalListingTitle, setModalListingTitle] = useState("");
  const [userRoles, setUserRoles] = useState({});
  const [roleRequests, setRoleRequests] = useState([]);

  // 🔹 Agent-Profildaten für Modal
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [agentModalLoading, setAgentModalLoading] = useState(false);
  const [agentModalError, setAgentModalError] = useState("");
  const [selectedAgentProfile, setSelectedAgentProfile] = useState(null);

  const itemsPerPage = 5;
  const storage = getStorage();

  // 🔹 Finance Leads – EINMALIG laden
  useEffect(() => {
    const fetchFinanceLeads = async () => {
      try {
        const snap = await getDocs(collection(db, "financeLeads"));
        const items = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setFinanceLeads(items);
      } catch (err) {
        console.error("[AdminDashboard] Fehler beim Laden der FinanceLeads:", err);
        setFinanceLeads([]);
      }
    };

    fetchFinanceLeads();
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

  // 🔹 Role upgrade requests
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

  const logActivity = async (action, detail, userId = "admin-dashboard") => {
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

  // 🔹 Finance Leads – Status ändern
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

  // ✅ Approve Role-Request
  const handleApproveRequest = async (req, overrideRole) => {
    const requestId = req.id;
    const userId = req.userId;
    const targetRole = overrideRole || req.targetRole || "owner";

    try {
      await updateDoc(doc(db, "users", userId), { role: targetRole });

      if (targetRole === "agent") {
        try {
          await updateDoc(doc(db, "agents", userId), {
            verified: true,
            verifiedAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Error verifying agent profile:", err);
        }
      }

      await updateDoc(doc(db, "roleUpgradeRequests", requestId), {
        status: "approved",
        reviewedAt: serverTimestamp(),
        reviewedBy: "admin-dashboard",
      });

      setRoleRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "approved" } : r
        )
      );

      // 🔵 LOG: Rollenwechsel genehmigt
      await logEvent({
        type: "role.approved",
        message: `Rollenwechsel auf "${targetRole}" wurde genehmigt.`,
        userId,
        targetRole,
        context: "admin-dashboard",
        extra: {
          requestId,
          decidedBy: "admin-dashboard",
        },
      });

      await logActivity(
        "Approved role upgrade",
        `UserID: ${userId} → ${targetRole}`
      );
    } catch (err) {
      console.error("[AdminDashboard] handleApproveRequest error:", err);
    }
  };

  // ❌ Reject Role-Request
  const handleRejectRequest = async (req) => {
    const requestId = req.id;
    const userId = req.userId;

    try {
      const reason =
        window.prompt(
          "Ablehnungsgrund (optional):",
          req.rejectReason || ""
        ) || null;

      await updateDoc(doc(db, "roleUpgradeRequests", requestId), {
        status: "rejected",
        rejectReason: reason,
        reviewedAt: serverTimestamp(),
        reviewedBy: "admin-dashboard",
      });

      setRoleRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "rejected", rejectReason: reason }
            : r
        )
      );

      await logActivity(
        "Rejected role upgrade",
        `RequestID: ${requestId}, UserID: ${userId}, Reason: ${reason || "n/a"}`
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  // 🔍 Agentenprofil aus agents/{userId} laden und Modal öffnen
  const handleOpenAgentProfile = async (req) => {
    if (!req?.userId) return;

    setAgentModalOpen(true);
    setAgentModalLoading(true);
    setAgentModalError("");
    setSelectedAgentProfile(null);

    try {
      const snap = await getDoc(doc(db, "agents", req.userId));

      if (!snap.exists()) {
        setAgentModalError(
          t("agentProfileModal.noProfile", {
            defaultValue:
              "Für diese Anfrage ist noch kein Maklerprofil hinterlegt.",
          })
        );
        return;
      }

      const agent = { id: snap.id, ...snap.data() };
      setSelectedAgentProfile(agent);

      // optionales Log
      await logEvent({
        type: "agent.profile.viewFromAdmin",
        userId: req.userId,
        targetRole: req.targetRole || "agent",
        context: "admin-dashboard",
        extra: {
          requestId: req.id,
        },
      });
    } catch (err) {
      console.error("[AdminDashboard] handleOpenAgentProfile error:", err);
      setAgentModalError(
        t("agentProfileModal.error", {
          defaultValue: "Profil konnte nicht geladen werden.",
        })
      );
    } finally {
      setAgentModalLoading(false);
    }
  };

  const handleCloseAgentProfile = () => {
    setAgentModalOpen(false);
    setSelectedAgentProfile(null);
    setAgentModalError("");
  };

  /**
   * 🔍 Bilder anzeigen:
   *  1. Wenn das Listing bereits imageUrls / imageUrl im Dokument hat → direkt nutzen.
   *  2. Sonst Fallback: Storage-Ordner "listings/{listingId}" durchsuchen.
   */
  const handleViewImages = async (listing) => {
    setShowModal(true);
    setIsLoadingImages(true);
    setModalError("");
    setModalListingTitle(listing.title || listing.id || "");
    setModalImages([]);

    try {
      let urls = [];

      if (Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0) {
        urls = listing.imageUrls;
      } else if (Array.isArray(listing.images) && listing.images.length > 0) {
        urls = listing.images;
      } else if (
        typeof listing.imageUrl === "string" &&
        listing.imageUrl.trim() !== ""
      ) {
        urls = [listing.imageUrl];
      } else {
        // Fallback: aus Storage lesen (Ordner: listings/{listing.id})
        const folderRef = ref(storage, `listings/${listing.id}`);
        const result = await listAll(folderRef);
        urls = await Promise.all(
          result.items.map((itemRef) => getDownloadURL(itemRef))
        );
      }

      if (!urls.length) {
        setModalError(t("noImagesFound"));
      }

      setModalImages(urls);
    } catch (err) {
      console.error("Error loading images for listing", listing?.id, err);
      setModalError(t("noImagesError"));
      setModalImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      await updateDoc(doc(db, "supportMessages", id), {
        status: "resolved",
      });
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

  const pendingRoleRequests = roleRequests.filter(
    (req) => !req.status || req.status === "pending"
  );

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

      {/* Listings Table Filter */}
      <div className="overflow-x-auto mb-4 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full md:w-40"
        >
          <option value="All">{t("statusAll")}</option>
          <option value="pending">{t("pending")}</option>
          <option value="active">{t("active")}</option>
          <option value="inactive">{t("inactive")}</option>
        </select>
      </div>

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
                    className="bg-white dark:bg-gray-800 border p-1 rounded"
                    value={listing.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(listing.id, e.target.value)
                    }
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="active">{t("active")}</option>
                    <option value="inactive">{t("inactive")}</option>
                  </select>
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs sm:text-sm"
                    >
                      {t("delete")}
                    </button>

                    <button
                      onClick={() => handleViewImages(listing)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs sm:text-sm"
                    >
                      {t("viewImages")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentListings.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {t("noListings")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-1 rounded text-sm border ${
                  page === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}

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
            {pendingRoleRequests.map((req) => (
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
                <td className="py-2 px-4 border flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOpenAgentProfile(req)}
                    className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 text-xs sm:text-sm"
                  >
                    {t("viewAgentProfile", {
                      defaultValue: "Profil öffnen",
                    })}
                  </button>
                  <button
                    onClick={() => handleApproveRequest(req)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm"
                  >
                    {t("approve")}
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm"
                  >
                    {t("reject")}
                  </button>
                </td>
              </tr>
            ))}

            {pendingRoleRequests.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {t("noRoleRequests")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     {/* Aktivitätsprotokoll */}
<div className="mt-8">
  <ActivityLogTable />
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
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm"
                    >
                      {t("markResolved")}
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {supportMessages.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {t("noSupportMessages")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal für Listing-Bilder */}
      <ImageModal
        images={modalImages}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setModalImages([]);
          setModalError("");
        }}
        isLoading={isLoadingImages}
        error={modalError}
        title={modalListingTitle}
      />

      {/* Modal für Agentenprofil */}
      <AgentProfileModal
        open={agentModalOpen}
        onClose={handleCloseAgentProfile}
        agent={selectedAgentProfile}
        loading={agentModalLoading}
        error={agentModalError}
      />
    </div>
  );
};

// 🔹 Sub-Component: AgentProfileModal
function AgentProfileModal({ open, onClose, agent, loading, error }) {
  const { t } = useTranslation("admin");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-950 text-gray-100 border border-slate-800 shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-400 hover:text-gray-200 text-xl leading-none"
          aria-label={t("agentProfileModal.close", { defaultValue: "Schließen" })}
        >
          &times;
        </button>

        <h3 className="text-lg font-semibold mb-3">
          {t("agentProfileModal.title", {
            defaultValue: "Maklerprofil",
          })}
        </h3>

        {loading && (
          <p className="text-sm text-gray-300">
            {t("agentProfileModal.loading", {
              defaultValue: "Profil wird geladen…",
            })}
          </p>
        )}

        {!loading && error && (
          <p className="text-sm text-rose-400">{error}</p>
        )}

        {!loading && !error && agent && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">
                {t("agentProfileModal.labels.name", { defaultValue: "Name: " })}
              </span>
              {agent.fullName || "—"}
            </div>

            {agent.email && (
              <div>
                <span className="font-semibold">
                  {t("agentProfileModal.labels.email", { defaultValue: "E-Mail: " })}
                </span>
                {agent.email}
              </div>
            )}

            {agent.phone && (
              <div>
                <span className="font-semibold">
                  {t("agentProfileModal.labels.phone", { defaultValue: "Telefon: " })}
                </span>
                {agent.phone}
              </div>
            )}

            {(agent.city || agent.region) && (
              <div>
                <span className="font-semibold">
                  {t("agentProfileModal.labels.location", {
                    defaultValue: "Standort: ",
                  })}
                </span>
                {agent.city && agent.region
                  ? `${agent.city}, ${agent.region}`
                  : agent.city || agent.region}
              </div>
            )}

            {agent.companyName && (
              <div>
                <span className="font-semibold">
                  {t("agentProfileModal.labels.company", {
                    defaultValue: "Unternehmen: ",
                  })}
                </span>
                {agent.companyName}
              </div>
            )}

            {agent.languages && (
              <div>
                <span className="font-semibold">
                  {t("agentProfileModal.labels.languages", {
                    defaultValue: "Sprachen: ",
                  })}
                </span>
                {Array.isArray(agent.languages)
                  ? agent.languages.join(", ")
                  : agent.languages}
              </div>
            )}

            {agent.specialties && Array.isArray(agent.specialties) && (
              <div>
                <span className="font-semibold">
                  {t("agentProfileModal.labels.specialties", {
                    defaultValue: "Schwerpunkte: ",
                  })}
                </span>
                {agent.specialties.join(", ")}
              </div>
            )}

            {typeof agent.rating === "number" && (
              <div>
                <span className="font-semibold">
                  {t("agentProfileModal.labels.rating", {
                    defaultValue: "Bewertung: ",
                  })}
                </span>
                {agent.rating.toFixed(1)} / 5
              </div>
            )}

            {agent.verified && (
              <div className="text-emerald-300 text-xs">
                {t("agentProfileModal.labels.verified", {
                  defaultValue: "Verifizierte:r Makler:in",
                })}
              </div>
            )}

            {agent.createdAt?.toDate && (
              <div className="mt-2 text-xs text-gray-400">
                {t("agentProfileModal.labels.createdAt", {
                  defaultValue: "Profil erstellt am {{date}}",
                  date: agent.createdAt.toDate().toLocaleString("de-DE"),
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-gray-100 hover:bg-slate-700"
          >
            {t("agentProfileModal.close", { defaultValue: "Schließen" })}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
