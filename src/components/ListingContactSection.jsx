import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import ContactOwnerModal from "./ContactOwnerModal";
import ContactOwnerChat from "./ContactOwnerChat";
import {
  FiMail,
  FiMessageSquare,
  FiCalendar,
  FiShield,
  FiUser,
} from "react-icons/fi";

const ListingContactSection = ({ listing }) => {
  const { t } = useTranslation("contact");
  const { currentUser } = useAuth();

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const ownerId =
    listing?.ownerId || listing?.userId || listing?.ownerUID || null;

  const ownerEmail =
    listing?.ownerEmail || listing?.contactEmail || listing?.email || null;

  const canShowContact = Boolean(ownerEmail);
  const canShowChat = Boolean(ownerId && currentUser);

  const listingPayload = useMemo(
    () => ({
      id: listing?.id || "",
      listingId: listing?.id || "",
      title: listing?.title || "",
      city: listing?.city || "",
      ownerId,
      ownerEmail,
    }),
    [listing, ownerId, ownerEmail]
  );

  if (!listing) return null;
  if (!ownerId && !ownerEmail) return null;

  return (
    <section className="mt-6">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-5 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                <FiShield className="text-sm" />
                {t("contactBadge", {
                  defaultValue: "Direkter Kontakt",
                })}
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("title", {
                  defaultValue: "Verkäufer:in kontaktieren",
                })}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                {t("page.contactInfoText", {
                  defaultValue:
                    "Stellen Sie Ihre Fragen direkt zur Immobilie, fordern Sie weitere Informationen an oder vereinbaren Sie einen Besichtigungstermin.",
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-950/70">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <FiUser className="text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">
                  {t("advisorTitle", {
                    defaultValue: "Ansprechpartner:in",
                  })}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {ownerEmail
                  ? ownerEmail
                  : t("ownerAvailable", {
                      defaultValue: "Eigentümer:in verfügbar",
                    })}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-5 md:px-6 md:py-6">
          {/* Quick benefits */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <FiMail />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("benefits.directMessageTitle", {
                  defaultValue: "Direkte Nachricht",
                })}
              </h3>
              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                {t("benefits.directMessageText", {
                  defaultValue:
                    "Schreiben Sie direkt zur Immobilie und erhalten Sie schneller eine Rückmeldung.",
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <FiCalendar />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("benefits.visitTitle", {
                  defaultValue: "Besichtigung anfragen",
                })}
              </h3>
              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                {t("benefits.visitText", {
                  defaultValue:
                    "Klären Sie offene Fragen und vereinbaren Sie auf Wunsch direkt einen Termin.",
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <FiMessageSquare />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("benefits.fastResponseTitle", {
                  defaultValue: "Schneller Austausch",
                })}
              </h3>
              <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                {t("benefits.fastResponseText", {
                  defaultValue:
                    "Nutzen Sie Formular oder Chat, um Details effizient zu besprechen.",
                })}
              </p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {canShowContact && (
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <FiMail />
                {t("buttons.send", {
                  defaultValue: "Nachricht senden",
                })}
              </button>
            )}

            {canShowChat && (
              <button
                type="button"
                onClick={() => setShowChat((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                <FiMessageSquare />
                {showChat
                  ? t("contactForm.closeChat", {
                      defaultValue: "Chat ausblenden",
                    })
                  : t("contactForm.openChat", {
                      defaultValue: "Chat öffnen",
                    })}
              </button>
            )}

            {!currentUser && ownerId && (
              <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {t("loginHint", {
                  defaultValue:
                    "Melden Sie sich an, um den Live-Chat zu nutzen.",
                })}
              </div>
            )}
          </div>

          {/* Small info note */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-slate-950/50 dark:text-gray-300">
            {t("privacyHint", {
              defaultValue:
                "Ihre Anfrage wird direkt im Zusammenhang mit diesem Inserat übermittelt.",
            })}
          </div>

          {/* Chat */}
          {showChat && canShowChat && (
            <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("chatTitle", {
                    defaultValue: "Direkter Chat zum Inserat",
                  })}
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  {t("chatLive", {
                    defaultValue: "Aktiv",
                  })}
                </span>
              </div>

              <ContactOwnerChat listingId={listing.id} ownerId={ownerId} />
            </div>
          )}
        </div>
      </div>

      {/* Contact modal */}
      {canShowContact && (
        <ContactOwnerModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          ownerEmail={ownerEmail}
          listing={listingPayload}
        />
      )}
    </section>
  );
};

export default ListingContactSection;