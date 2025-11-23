import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ContactOwnerModal from './ContactOwnerModal';
import ContactOwnerChat from './ContactOwnerChat';

const ListingContactSection = ({ listing }) => {
  const { t } = useTranslation('contact');
  const { currentUser } = useAuth();

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  if (!listing) return null;

  // Provojmë disa emra të ndryshëm që mund të kesh përdorur
  const ownerId =
    listing.ownerId || listing.userId || listing.ownerUID || null;

  const ownerEmail =
    listing.ownerEmail || listing.contactEmail || listing.email || null;

  // Nëse nuk dimë as pronarin, atëherë s’kemi çfarë të tregojmë
  if (!ownerId && !ownerEmail) return null;

  const handleOpenContact = () => setIsContactOpen(true);
  const handleCloseContact = () => setIsContactOpen(false);

  return (
    <section className="mt-6 bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 md:p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
        {t('title', { defaultValue: 'Verkäufer:in kontaktieren' })}
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {t('page.contactInfoText', {
          defaultValue:
            'Stellen Sie Ihre Fragen direkt zur Immobilie oder vereinbaren Sie einen Besichtigungstermin.',
        })}
      </p>

      <div className="flex flex-wrap gap-3">
        {/* Butoni: Formular kontaktimi (modal) */}
        {ownerEmail && (
          <button
            type="button"
            onClick={handleOpenContact}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            {t('buttons.send', { defaultValue: 'Nachricht senden' })}
          </button>
        )}

        {/* Butoni: Chat (opsional, vetëm nëse kemi ownerId dhe user i loguar) */}
        {ownerId && currentUser && (
          <button
            type="button"
            onClick={() => setShowChat((s) => !s)}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {showChat
              ? t('contactForm.closeChat', { defaultValue: 'Chat ausblenden' })
              : t('contactForm.openChat', { defaultValue: 'Chat öffnen' })}
          </button>
        )}
      </div>

      {/* Chat-box poshtë butonave (opsional) */}
      {showChat && ownerId && (
        <div className="mt-4">
          <ContactOwnerChat listingId={listing.id} ownerId={ownerId} />
        </div>
      )}

      {/* Modal-i për mesazh me e-mail (ruhet në koleksionin contacts) */}
      {ownerEmail && (
        <ContactOwnerModal
          isOpen={isContactOpen}
          onClose={handleCloseContact}
          ownerEmail={ownerEmail}
          listing={{
            id: listing.id,
            listingId: listing.id,
            title: listing.title,
          }}
        />
      )}
    </section>
  );
};

export default ListingContactSection;
