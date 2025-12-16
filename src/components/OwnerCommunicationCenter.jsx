// src/components/OwnerCommunicationCenter.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';
import {
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiEye,
  FiPhone,
  FiCopy,
  FiSend,
} from 'react-icons/fi';

const OwnerCommunicationCenter = ({ ownerId }) => {
  const { t } = useTranslation('ownerDashboard');

  const [contacts, setContacts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedListingId, setExpandedListingId] = useState(null);

  // Reply UI state
  const [replyOpenContactId, setReplyOpenContactId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [repliesByContact, setRepliesByContact] = useState({}); // { [contactId]: Reply[] }

  // ---------------------------------------------------
  // Daten laden (Kontaktanfragen + Angebote)
  // ---------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      if (!ownerId) {
        setContacts([]);
        setOffers([]);
        setRepliesByContact({});
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Kontakte
        const qContacts = query(
          collection(db, 'contacts'),
          where('ownerId', '==', ownerId)
        );
        const snapContacts = await getDocs(qContacts);
        const contactsItems = snapContacts.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Angebote
        const qOffers = query(
          collection(db, 'offers'),
          where('ownerId', '==', ownerId)
        );
        const snapOffers = await getDocs(qOffers);
        const offersItems = snapOffers.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setContacts(contactsItems);
        setOffers(offersItems);

        // ✅ Replies (pro Kontakt) nachladen
        const replyMap = {};
        await Promise.all(
          contactsItems.map(async (c) => {
            try {
              const repliesRef = collection(db, 'contacts', c.id, 'replies');
              // ✅ Wichtig: wir sortieren nach sentAt (wie Cloud Function)
              const qRep = query(repliesRef, orderBy('sentAt', 'asc'));
              const repSnap = await getDocs(qRep);
              replyMap[c.id] = repSnap.docs.map((x) => ({ id: x.id, ...x.data() }));
            } catch (e) {
              // Falls Subcollection noch nicht existiert oder Rules blocken:
              replyMap[c.id] = [];
            }
          })
        );
        setRepliesByContact(replyMap);
      } catch (err) {
        console.error('[OwnerCommunicationCenter] loadData error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ownerId]);

  // ---------------------------------------------------
  // Aggregation nach Listing
  // ---------------------------------------------------
  const grouped = useMemo(() => {
    const map = new Map();

    // Kontakte gruppieren
    for (const c of contacts) {
      const lid = c.listingId || 'unknown';
      if (!map.has(lid)) {
        map.set(lid, {
          listingId: lid,
          listingTitle: c.listingTitle || '',
          listingCity: c.listingCity || c.city || '',
          contacts: [],
          offers: [],
        });
      }
      map.get(lid).contacts.push(c);
    }

    // Angebote gruppieren
    for (const o of offers) {
      const lid = o.listingId || 'unknown';
      if (!map.has(lid)) {
        map.set(lid, {
          listingId: lid,
          listingTitle: o.listingTitle || '',
          listingCity: o.listingCity || o.city || '',
          contacts: [],
          offers: [],
        });
      }
      map.get(lid).offers.push(o);
    }

    // in Array umwandeln und sortieren
    const arr = Array.from(map.values());
    arr.sort((a, b) => (a.listingTitle || '').localeCompare(b.listingTitle || ''));
    return arr;
  }, [contacts, offers]);

  const stats = useMemo(() => {
    return {
      totalListings: grouped.length,
      totalContacts: contacts.length,
      totalOffers: offers.length,
    };
  }, [grouped.length, contacts.length, offers.length]);

  const toggleExpand = (listingId) => {
    setExpandedListingId((prev) => (prev === listingId ? null : listingId));
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    if (ts?.toDate) return ts.toDate().toLocaleString('de-DE');
    try {
      return new Date(ts).toLocaleString('de-DE');
    } catch {
      return '—';
    }
  };

  const safeStr = (v) => (v == null ? '' : String(v));

  // ✅ Normalisierung: du speicherst name/email/phone – wir supporten auch alte Felder
  const normalizeContact = (c) => {
    const name =
      c?.name ||
      c?.fullName ||
      c?.userName ||
      c?.senderName ||
      t('communicationCenter.unknownSender', { defaultValue: 'Unbekannt' });

    const email =
      c?.email ||
      c?.userEmail ||
      c?.senderEmail ||
      c?.contactEmail ||
      '';

    const phone =
      c?.phone ||
      c?.phoneNumber ||
      c?.tel ||
      '';

    const message = c?.message || '';

    return { name, email, phone, message };
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(t('communicationCenter.copied', { defaultValue: 'Kopiert.' }));
    } catch {
      alert(t('communicationCenter.copyFailed', { defaultValue: 'Kopieren fehlgeschlagen.' }));
    }
  };

  // ---------------------------------------------------
  // Reply UI
  // ---------------------------------------------------
  const openReply = (contactId) => {
    setReplyOpenContactId(contactId);
    setReplyText('');
  };

  const closeReply = () => {
    setReplyOpenContactId(null);
    setReplyText('');
  };

  // ---------------------------------------------------
  // ✅ Reply SENDEN (Subcollection) -> Cloud Function sendet E-Mail automatisch
  // Trigger: contacts/{contactId}/replies/{replyId}
  // ---------------------------------------------------
  const sendReplyToContact = async (contact) => {
    const cid = contact?.id;
    const text = replyText.trim();
    if (!cid || !text) return;

    setSendingReply(true);
    try {
      const { email } = normalizeContact(contact);

      // ✅ speichern: contacts/{contactId}/replies
      // ✅ sentAt muss stimmen (Cloud Function erwartet sentAt oder nutzt nur message)
      const repliesRef = collection(db, 'contacts', cid, 'replies');
      await addDoc(repliesRef, {
        ownerId: ownerId || null,
        ownerEmail: contact?.ownerEmail || null, // optional
        contactId: cid,
        listingId: contact?.listingId || null,
        listingTitle: contact?.listingTitle || '',
        // Optional: Zieladresse (nice-to-have fürs Debug/UI)
        toEmail: email || null,
        message: text,
        sentAt: serverTimestamp(), // ✅ WICHTIG: gleiche Feldlogik wie Function
        source: 'owner-dashboard',
        status: 'queued', // optional für UI
      });

      // UI Update (optimistisch)
      setRepliesByContact((prev) => {
        const prevArr = Array.isArray(prev[cid]) ? prev[cid] : [];
        return {
          ...prev,
          [cid]: [
            ...prevArr,
            {
              id: `local-${Date.now()}`,
              ownerId,
              contactId: cid,
              listingId: contact?.listingId || null,
              listingTitle: contact?.listingTitle || '',
              toEmail: email || null,
              message: text,
              sentAt: new Date(),
              source: 'owner-dashboard',
              status: 'queued',
            },
          ],
        };
      });

      alert(t('communicationCenter.replySent', { defaultValue: 'Antwort wurde gesendet.' }));
      closeReply();
    } catch (err) {
      console.error('[OwnerCommunicationCenter] sendReply error:', err);
      alert(t('communicationCenter.replyError', { defaultValue: 'Antwort konnte nicht gesendet werden.' }));
    } finally {
      setSendingReply(false);
    }
  };

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <section className="mt-10 bg-slate-950/60 dark:bg-gray-950/70 border border-slate-800/70 dark:border-gray-900 rounded-2xl shadow-sm">
      <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-800/70 dark:border-gray-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            {t('communicationCenter.title', { defaultValue: 'Kommunikations-Center' })}
          </h2>
          <p className="text-sm text-gray-400">
            {t('communicationCenter.subtitle', {
              defaultValue: 'Alle Kontaktanfragen und Kaufangebote gebündelt pro Inserat.',
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <CommChip
            label={t('communicationCenter.chips.listings', { defaultValue: 'Inserate' })}
            value={stats.totalListings}
          />
          <CommChip
            label={t('communicationCenter.chips.contacts', { defaultValue: 'Kontaktanfragen' })}
            value={stats.totalContacts}
          />
          <CommChip
            label={t('communicationCenter.chips.offers', { defaultValue: 'Angebote' })}
            value={stats.totalOffers}
          />
        </div>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-5">
        {loading ? (
          <p className="text-sm text-gray-400">
            {t('communicationCenter.loading', { defaultValue: 'Daten werden geladen…' })}
          </p>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-gray-400">
            {t('communicationCenter.empty', {
              defaultValue: 'Es liegen noch keine Kontaktanfragen oder Angebote zu deinen Inseraten vor.',
            })}
          </p>
        ) : (
          <div className="space-y-3">
            {grouped.map((item) => (
              <div
                key={item.listingId}
                className="rounded-2xl border border-slate-800 bg-slate-950/80"
              >
                {/* Kopfzeile pro Listing */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.listingId)}
                  className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-4 text-left"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-100 line-clamp-1">
                      {item.listingTitle ||
                        t('communicationCenter.unknownListing', { defaultValue: 'Unbekanntes Inserat' })}
                    </div>
                    {item.listingCity && (
                      <div className="text-xs text-gray-400">{item.listingCity}</div>
                    )}
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-400">
                      <span>
                        {t('communicationCenter.badges.contacts', {
                          count: item.contacts.length,
                          defaultValue: `Kontaktanfragen: ${item.contacts.length}`,
                        })}
                      </span>
                      <span>
                        {t('communicationCenter.badges.offers', {
                          count: item.offers.length,
                          defaultValue: `Angebote: ${item.offers.length}`,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden md:inline text-xs text-gray-400">
                      {t('communicationCenter.toggleDetails', { defaultValue: 'Details anzeigen' })}
                    </span>
                    {expandedListingId === item.listingId ? (
                      <FiChevronUp className="text-gray-300" />
                    ) : (
                      <FiChevronDown className="text-gray-300" />
                    )}
                  </div>
                </button>

                {/* Detailbereich */}
                {expandedListingId === item.listingId && (
                  <div className="border-t border-slate-800 px-4 py-3 md:px-5 md:py-4 space-y-4 text-sm">
                    {/* Kontaktanfragen */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-2">
                        <FiMail />
                        {t('communicationCenter.section.contacts', { defaultValue: 'Kontaktanfragen' })}
                      </h3>

                      {item.contacts.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          {t('communicationCenter.noContacts', {
                            defaultValue: 'Keine Kontaktanfragen zu diesem Inserat.',
                          })}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {item.contacts.map((c) => {
                            const norm = normalizeContact(c);
                            const replies = repliesByContact?.[c.id] || [];

                            return (
                              <div
                                key={c.id}
                                className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3"
                              >
                                {/* Kopf */}
                                <div className="flex justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-gray-100">
                                      {norm.name}
                                    </div>

                                    <div className="mt-0.5 space-y-1">
                                      {norm.email ? (
                                        <div className="text-[11px] text-gray-300 break-all">
                                          {norm.email}
                                        </div>
                                      ) : (
                                        <div className="text-[11px] text-gray-500">
                                          {t('communicationCenter.noEmail', { defaultValue: 'Keine E-Mail angegeben.' })}
                                        </div>
                                      )}

                                      {norm.phone ? (
                                        <div className="text-[11px] text-gray-300 break-all">
                                          {norm.phone}
                                        </div>
                                      ) : (
                                        <div className="text-[11px] text-gray-500">
                                          {t('communicationCenter.noPhone', { defaultValue: 'Keine Telefonnummer angegeben.' })}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-[11px] text-gray-400 text-right flex-shrink-0">
                                    {formatDate(c.sentAt || c.createdAt)}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {norm.email && (
                                    <a
                                      href={`mailto:${norm.email}?subject=${encodeURIComponent(
                                        t('communicationCenter.mailSubject', {
                                          defaultValue: `Antwort zu deinem Interesse: ${item.listingTitle || ''}`,
                                        })
                                      )}`}
                                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700"
                                    >
                                      <FiMail />
                                      {t('communicationCenter.actions.mail', { defaultValue: 'E-Mail' })}
                                    </a>
                                  )}

                                  {norm.phone && (
                                    <a
                                      href={`tel:${norm.phone}`}
                                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700"
                                    >
                                      <FiPhone />
                                      {t('communicationCenter.actions.call', { defaultValue: 'Anrufen' })}
                                    </a>
                                  )}

                                  {(norm.email || norm.phone) && (
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard([norm.name, norm.email, norm.phone].filter(Boolean).join(' | '))}
                                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700"
                                    >
                                      <FiCopy />
                                      {t('communicationCenter.actions.copy', { defaultValue: 'Kopieren' })}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => openReply(c.id)}
                                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    <FiSend />
                                    {t('communicationCenter.actions.reply', { defaultValue: 'Antworten' })}
                                  </button>
                                </div>

                                {/* Message */}
                                {norm.message && (
                                  <p className="mt-2 text-xs text-gray-200 whitespace-pre-line">
                                    {norm.message}
                                  </p>
                                )}

                                {/* Replies list */}
                                {replies.length > 0 && (
                                  <div className="mt-3 border-t border-slate-800 pt-2">
                                    <div className="text-[11px] text-gray-400 font-semibold mb-1">
                                      {t('communicationCenter.replies.title', { defaultValue: 'Deine Antworten' })}
                                    </div>
                                    <div className="space-y-1">
                                      {replies.map((r) => (
                                        <div
                                          key={r.id}
                                          className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2"
                                        >
                                          <div className="text-[11px] text-gray-400 flex justify-between gap-2">
                                            <span>
                                              {t('communicationCenter.replies.sentAt', { defaultValue: 'Gesendet' })}:{' '}
                                              {formatDate(r.sentAt || r.createdAt)}
                                            </span>
                                            {r.toEmail ? (
                                              <span className="text-gray-500 break-all">{r.toEmail}</span>
                                            ) : null}
                                          </div>
                                          <div className="text-xs text-gray-200 whitespace-pre-line mt-1">
                                            {safeStr(r.message)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Reply editor */}
                                {replyOpenContactId === c.id && (
                                  <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                    <div className="text-[11px] text-gray-400 mb-2">
                                      {t('communicationCenter.replyHint', {
                                        defaultValue:
                                          'Schreibe eine Antwort. Beim Klicken auf "Senden" wird automatisch eine E-Mail verschickt (Cloud Function).',
                                      })}
                                    </div>

                                    <textarea
                                      rows={4}
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                      placeholder={t('communicationCenter.replyPlaceholder', {
                                        defaultValue: 'Deine Antwort…',
                                      })}
                                    />

                                    <div className="mt-2 flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={closeReply}
                                        className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                                      >
                                        {t('communicationCenter.buttons.cancel', { defaultValue: 'Abbrechen' })}
                                      </button>
                                      <button
                                        type="button"
                                        disabled={sendingReply || !replyText.trim()}
                                        onClick={() => sendReplyToContact(c)}
                                        className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                      >
                                        {sendingReply
                                          ? t('communicationCenter.buttons.sending', { defaultValue: 'Wird gesendet…' })
                                          : t('communicationCenter.buttons.send', { defaultValue: 'Senden' })}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Angebote */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-2">
                        <FiEye />
                        {t('communicationCenter.section.offers', { defaultValue: 'Kaufangebote' })}
                      </h3>
                      {item.offers.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          {t('communicationCenter.noOffers', { defaultValue: 'Keine Angebote zu diesem Inserat.' })}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {item.offers.map((o) => (
                            <div
                              key={o.id}
                              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2"
                            >
                              <div className="flex justify-between gap-2">
                                <div>
                                  <div className="text-xs font-semibold text-gray-100">
                                    {o.buyerName || o.buyerEmail || '—'}
                                  </div>
                                  {o.buyerEmail && (
                                    <div className="text-[11px] text-gray-400 break-all">
                                      {o.buyerEmail}
                                    </div>
                                  )}
                                  <div className="mt-1 text-xs text-gray-300">
                                    {formatOfferPrice(o.amount)} ·{' '}
                                    {(o.status || 'open') === 'open'
                                      ? t('communicationCenter.status.open', { defaultValue: 'Offen' })
                                      : t(`communicationCenter.status.${o.status}`, { defaultValue: o.status })}
                                  </div>
                                </div>
                                <div className="text-[11px] text-gray-400 text-right">
                                  {formatDate(o.createdAt)}
                                </div>
                              </div>
                              {o.message && (
                                <p className="mt-1 text-xs text-gray-200 whitespace-pre-line">
                                  {o.message}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OwnerCommunicationCenter;

// -------------------------------------------------------
// Kleine Hilfs-Komponenten
// -------------------------------------------------------
function CommChip({ label, value }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-slate-800 text-slate-200 text-xs">
      <span className="font-medium">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function formatOfferPrice(value) {
  if (typeof value === 'number') {
    return `€ ${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;
  }
  if (!value) return '€ —';
  return `€ ${value}`;
}
