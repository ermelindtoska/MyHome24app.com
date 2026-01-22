'use strict';

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getAuth } = require('firebase-admin/auth');

const sgMail = require('@sendgrid/mail');

const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// =============================
// 🔐 Secret (NUR SendGrid)
// =============================
const SENDGRID_API_KEY = defineSecret('SENDGRID_API_KEY');

// =============================
// ✉️ Defaults
// =============================
const DEFAULT_ADMIN_EMAIL = 'kontakt@myhome24app.com';
const VERIFIED_FROM_EMAIL = 'noreply@myhome24app.com'; // muss bei SendGrid als Sender verifiziert sein

// =====================================================
// ✅ STABILES Admin Init (immer Default App)
// =====================================================
function ensureAdmin() {
  if (!getApps().length) {
    initializeApp(); // nutzt automatisch die Runtime-Credentials in Cloud Functions
    logger.info('✅ Firebase Admin initialized (default app)');
  }
}

function getDb() {
  ensureAdmin();
  return getFirestore();
}

// =====================================================
// ✅ SendGrid Setup (trim + sichere Logs)
// =====================================================
function setSendGrid() {
  const raw = SENDGRID_API_KEY.value();
  const key = (raw || '').trim();

  // niemals Key loggen!
  if (!key || key.length < 20) {
    throw new Error(
      `SENDGRID_API_KEY missing/invalid. length=${key.length}. ` +
      `Bitte Secret neu setzen (firebase functions:secrets:set SENDGRID_API_KEY).`
    );
  }

  sgMail.setApiKey(key);
}

// =====================================================
// 📬 1) Neue Kontaktanfrage
// Trigger: contacts/{contactId}
// =====================================================
exports.sendNewContactNotificationFinalV2 = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'contacts/{contactId}',
    secrets: [SENDGRID_API_KEY],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    const contactId = event.params?.contactId;

    try {
      const contact = event.data?.data();
      if (!contact) {
        logger.error('❌ Missing contact data', { contactId });
        return;
      }

      const db = getDb();
      setSendGrid();

      // 1) Typ bestimmen
      const isAgentContact =
        contact.category === 'agent-contact' || contact.source === 'agent-profile';

      const isListingContact =
        !!contact.listingId ||
        !!contact.listingTitle ||
        contact.source === 'listingDetailsModal' ||
        contact.source === 'contactOwnerModal';

      // 2) ownerEmail sauber ermitteln (falls im Contact fehlt)
      let resolvedOwnerEmail = contact.ownerEmail || null;

      if (isListingContact && !resolvedOwnerEmail && contact.listingId) {
        try {
          const listingSnap = await db.collection('listings').doc(contact.listingId).get();
          if (listingSnap.exists) {
            const listingData = listingSnap.data();
            resolvedOwnerEmail =
              listingData?.ownerEmail ||
              listingData?.email ||
              listingData?.userEmail ||
              null;
          }
        } catch (e) {
          logger.error('❌ Could not resolve ownerEmail from listing', { contactId, err: e?.message || e });
        }
      }

      // 3) Zieladresse festlegen
      let targetEmail = DEFAULT_ADMIN_EMAIL;

      if (isListingContact && resolvedOwnerEmail) {
        targetEmail = resolvedOwnerEmail;
      } else if (isAgentContact && (contact.ownerEmail || resolvedOwnerEmail)) {
        targetEmail = contact.ownerEmail || resolvedOwnerEmail;
      } else {
        targetEmail = DEFAULT_ADMIN_EMAIL;
      }

      if (!targetEmail) {
        logger.error('❌ No target email found', { contactId });
        return;
      }

      const senderName = contact.name || 'Unbekannt';
      const senderEmail = contact.email || 'keine Angabe';
      const subjectFromForm = (contact.subject || '').trim();

      const baseSubjectAgent = 'Neue Nachricht über dein Makler:innenprofil';
      const baseSubjectDefault = 'Neue Kontaktanfrage über MyHome24App';

      const subject =
        '📨 ' +
        (isAgentContact ? baseSubjectAgent : baseSubjectDefault) +
        (subjectFromForm ? ` – ${subjectFromForm}` : '');

      const listingInfoText = contact.listingTitle ? `\nBezug: ${contact.listingTitle}\n` : '';
      const infoText = isAgentContact
        ? 'Die Nachricht wurde über das öffentliche Makler:innenprofil auf MyHome24App gesendet.'
        : 'Die Nachricht wurde über das allgemeine Kontaktformular auf MyHome24App gesendet.';

      const textBody = `
${isAgentContact ? 'Hallo Makler:in,' : 'Hallo MyHome24App-Team,'}

es ist eine neue Nachricht eingegangen.

Von: ${senderName} (${senderEmail})
Telefon: ${contact.phone || '—'}
${listingInfoText}
Nachricht:
${contact.message || ''}

${infoText}

Viele Grüße
MyHome24App – Systembenachrichtigung
      `.trim();

      const listingInfoHtml = contact.listingTitle
        ? `<p><strong>Bezug:</strong> ${contact.listingTitle}</p>`
        : '';

      const infoHtml = isAgentContact
        ? '<p>Diese Nachricht wurde über dein öffentliches Makler:innenprofil auf <strong>MyHome24App</strong> gesendet.</p>'
        : '<p>Diese Nachricht wurde über das allgemeine Kontaktformular auf <strong>MyHome24App</strong> gesendet.</p>';

      const msg = {
        to: targetEmail,
        from: VERIFIED_FROM_EMAIL,
        replyTo: contact.email || undefined,
        subject,
        text: textBody,
        html: `
          <p>${isAgentContact ? 'Hallo Makler:in,' : 'Hallo MyHome24App-Team,'}</p>
          <p>es ist eine neue Nachricht eingegangen.</p>

          <p><strong>Von:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>Telefon:</strong> ${contact.phone || '—'}</p>

          ${listingInfoHtml}

          <p><strong>Nachricht:</strong><br/>${(contact.message || '')
            .toString()
            .replace(/\n/g, '<br/>')}</p>

          ${infoHtml}

          <p>Viele Grüße<br/>MyHome24App – Systembenachrichtigung</p>
        `,
      };

      await sgMail.send(msg);

      logger.info('✅ Contact email sent', {
        contactId,
        targetEmail,
        isAgentContact,
        isListingContact,
        category: contact.category || '-',
        source: contact.source || '-',
      });
    } catch (error) {
      const status = error?.code || error?.response?.statusCode || error?.response?.status;
      const body = error?.response?.body;
      logger.error('❌ SendGrid/Function error (sendNewContactNotificationFinalV2)', {
        contactId,
        status,
        body: body || null,
        message: error?.message || String(error),
      });
    }
  }
);

// =====================================================
// 📧 2) Reply vom Owner an Interessent:in
// Trigger: contacts/{contactId}/replies/{replyId}
// =====================================================
exports.sendContactReplyEmailFinalV2 = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'contacts/{contactId}/replies/{replyId}',
    secrets: [SENDGRID_API_KEY],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    const contactId = event.params?.contactId;
    const replyId = event.params?.replyId;

    try {
      const reply = event.data?.data();
      if (!reply || !contactId) {
        logger.error('❌ Missing reply data or contactId', { contactId, replyId });
        return;
      }

      const db = getDb();
      setSendGrid();

      const contactSnap = await db.collection('contacts').doc(contactId).get();
      if (!contactSnap.exists) {
        logger.error('❌ Contact not found', { contactId });
        return;
      }

      const contact = contactSnap.data();
      const toEmail = (contact?.email || '').trim();

      if (!toEmail) {
        logger.error('❌ contact.email missing -> cannot send reply email', { contactId });
        return;
      }

      const listingTitle = contact?.listingTitle ? ` – ${contact.listingTitle}` : '';
      const subject = `📩 Antwort auf deine Anfrage${listingTitle}`;

      const ownerEmail = (reply?.ownerEmail || contact?.ownerEmail || DEFAULT_ADMIN_EMAIL || '').trim();

      const textBody = `
Hallo,

du hast eine Antwort auf deine Anfrage erhalten.

Bezug: ${contact?.listingTitle || '-'}
Deine Nachricht:
${contact?.message || '-'}

Antwort:
${reply?.message || '-'}

Viele Grüße
MyHome24App
      `.trim();

      const htmlBody = `
        <p>Hallo,</p>
        <p>du hast eine Antwort auf deine Anfrage erhalten.</p>

        <p><strong>Bezug:</strong> ${contact?.listingTitle || '-'}</p>

        <p><strong>Deine Nachricht:</strong><br/>${(contact?.message || '-')
          .toString()
          .replace(/\n/g, '<br/>')}</p>

        <hr/>

        <p><strong>Antwort:</strong><br/>${(reply?.message || '-')
          .toString()
          .replace(/\n/g, '<br/>')}</p>

        <p>Viele Grüße<br/>MyHome24App</p>
      `;

      const msg = {
        to: toEmail,
        from: VERIFIED_FROM_EMAIL,
        replyTo: ownerEmail || undefined,
        subject,
        text: textBody,
        html: htmlBody,
      };

      await sgMail.send(msg);

      logger.info('✅ Reply email sent', { toEmail, contactId, replyId });
    } catch (error) {
      const status = error?.code || error?.response?.statusCode || error?.response?.status;
      const body = error?.response?.body;
      logger.error('❌ SendGrid/Function error (sendContactReplyEmailFinalV2)', {
        contactId,
        replyId,
        status,
        body: body || null,
        message: error?.message || String(error),
      });
    }
  }
);

// =====================================================
// 📧 3) Role upgrade request -> Admin (nur targetRole="agent")
// Trigger: roleUpgradeRequests/{requestId}
// =====================================================
exports.sendRoleUpgradeRequestNotificationFinalV2 = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'roleUpgradeRequests/{requestId}',
    secrets: [SENDGRID_API_KEY],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    const requestId = event.params?.requestId;

    try {
      const requestData = event.data?.data();
      if (!requestData) {
        logger.error('❌ Missing roleUpgradeRequests data', { requestId });
        return;
      }

      const { userId, fullName, email, targetRole, reason, requestedAt, source } = requestData;

      if (targetRole !== 'agent') {
        logger.info('ℹ️ Skipping (only targetRole="agent")', { requestId, targetRole });
        return;
      }

      setSendGrid();

      const requestDate = requestedAt?.toDate
        ? requestedAt.toDate().toLocaleString('de-DE')
        : 'kein Datum';

      const subject = 'Neue Rollenfreigabe-Anfrage als Makler:in';

      const textBody = `
Hallo Admin-Team,

es liegt eine neue Anfrage zur Rollenfreigabe als Makler:in vor.

Benutzer-ID: ${userId || '-'}
Name:       ${fullName || '-'}
E-Mail:     ${email || '-'}

Zielrolle:  ${targetRole || '-'}
Quelle:     ${source || '-'}
Grund:      ${reason || '-'}
Angefragt am: ${requestDate}

Bitte prüft die Angaben im Admin-Dashboard (Bereich Rollen / Agenten)
und entscheidet über Freigabe oder Ablehnung.

Viele Grüße
MyHome24App – Systembenachrichtigung
      `.trim();

      const htmlBody = `
        <p>Hallo Admin-Team,</p>
        <p>es liegt eine neue Anfrage zur Rollenfreigabe als <strong>Makler:in</strong> vor.</p>

        <h3>Benutzerdaten</h3>
        <ul>
          <li><strong>Benutzer-ID:</strong> ${userId || '-'}</li>
          <li><strong>Name:</strong> ${fullName || '-'}</li>
          <li><strong>E-Mail:</strong> ${email || '-'}</li>
        </ul>

        <h3>Anfrage</h3>
        <ul>
          <li><strong>Zielrolle:</strong> ${targetRole || '-'}</li>
          <li><strong>Quelle:</strong> ${source || '-'}</li>
          <li><strong>Grund:</strong> ${reason || '-'}</li>
          <li><strong>Angefragt am:</strong> ${requestDate}</li>
        </ul>

        <p>Bitte prüft die Angaben im <strong>Admin-Dashboard</strong> (Bereich Rollen / Agenten)
        und entscheidet über Freigabe oder Ablehnung.</p>

        <p>Viele Grüße,<br/>MyHome24App – Systembenachrichtigung</p>
      `;

      const msg = {
        to: DEFAULT_ADMIN_EMAIL,
        from: VERIFIED_FROM_EMAIL,
        subject,
        text: textBody,
        html: htmlBody,
      };

      await sgMail.send(msg);

      logger.info('✅ Role upgrade email sent to admin', { requestId, userId });
    } catch (error) {
      const status = error?.code || error?.response?.statusCode || error?.response?.status;
      const body = error?.response?.body;
      logger.error('❌ SendGrid/Function error (sendRoleUpgradeRequestNotificationFinalV2)', {
        requestId,
        status,
        body: body || null,
        message: error?.message || String(error),
      });
    }
  }
);
// =====================================================
// ✅ 4) Email Verification (SendGrid direkt, pa Firestore)
// Callable: sendVerificationEmailDirectV2
// =====================================================
exports.sendVerificationEmailDirectV2 = onCall(
  {
    region: 'us-central1',
    secrets: [SENDGRID_API_KEY],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      // ✅ duhet user i loguar (Callable)
      const uid = request.auth?.uid;
      if (!uid) throw new HttpsError('unauthenticated', 'Not authenticated.');

      const locale = String(request.data?.locale || 'de').toLowerCase(); // de / en
      const continueUrl = String(
        request.data?.continueUrl || 'https://www.myhome24app.com/auth/action'
      );

      ensureAdmin();
      setSendGrid();

      const auth = getAuth();
      const user = await auth.getUser(uid);

      const email = (user?.email || '').trim();
      if (!email) throw new HttpsError('failed-precondition', 'User has no email.');
      if (user.emailVerified) {
        return { ok: true, alreadyVerified: true };
      }

      // ✅ Gjenero link verifikimi (Admin Auth)
      const actionCodeSettings = {
        url: continueUrl,         // faqja jote handler
        handleCodeInApp: true,
      };

      const link = await auth.generateEmailVerificationLink(email, actionCodeSettings);

      const isDE = locale.startsWith('de');
      const subject = isDE
        ? 'E-Mail bestätigen – MyHome24App'
        : 'Verify your email – MyHome24App';

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px">
          <h2 style="margin:0 0 10px">${isDE ? 'E-Mail bestätigen' : 'Verify your email'}</h2>
          <p style="color:#444;line-height:1.5">
            ${isDE
              ? 'Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren.'
              : 'Please verify your email address to activate your account.'}
          </p>
          <p style="margin:20px 0">
            <a href="${link}"
               style="background:#2563eb;color:#fff;padding:12px 16px;border-radius:10px;text-decoration:none;display:inline-block">
              ${isDE ? 'E-Mail bestätigen' : 'Verify email'}
            </a>
          </p>
          <p style="color:#777;font-size:12px;line-height:1.4">
            ${isDE
              ? 'Wenn du das nicht warst, ignoriere diese E-Mail.'
              : "If you didn't request this, you can ignore this email."}
          </p>
        </div>
      `;

      await sgMail.send({
        to: email,
        from: VERIFIED_FROM_EMAIL,
        subject,
        html,
      });

      logger.info('✅ Verification email sent (direct SendGrid)', {
        uid,
        email,
        continueUrl,
      });

      return { ok: true };
    } catch (error) {
      const status = error?.code || error?.response?.statusCode || error?.response?.status;
      const body = error?.response?.body;

      logger.error('❌ sendVerificationEmailDirectV2 error', {
        status,
        body: body || null,
        message: error?.message || String(error),
      });

      // nëse është HttpsError, ktheje ashtu
      if (error instanceof HttpsError) throw error;

      // përndryshe bëje HttpsError për klientin
      throw new HttpsError(
        'internal',
        'Failed to send verification email.',
        { status, message: error?.message || String(error) }
      );
    }
  }
);

