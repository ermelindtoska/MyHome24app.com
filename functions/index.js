const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const { logger } = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// 🔐 Sekretet për Firebase Admin
const FIREBASE_PRIVATE_KEY = defineSecret('FIREBASE_PRIVATE_KEY');
const FIREBASE_CLIENT_EMAIL = defineSecret('FIREBASE_CLIENT_EMAIL');
const FIREBASE_PROJECT_ID = defineSecret('FIREBASE_PROJECT_ID');

// 🔐 Sekreti për SendGrid
const SENDGRID_API_KEY = defineSecret('SENDGRID_API_KEY');
const DEFAULT_ADMIN_EMAIL = 'kontakt@myhome24app.com';

// 🧠 Funksion për inicializim të Firebase Admin brenda funksioneve
function initializeAdminIfNeeded() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID.value(),
        privateKey: FIREBASE_PRIVATE_KEY.value().replace(/\\n/g, '\n'),
        clientEmail: FIREBASE_CLIENT_EMAIL.value(),
      }),
    });
  }
}

// ---------------------------
// 📩 Funksioni për koment të ri
// ---------------------------
exports.sendNewCommentNotificationFinalV2 = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'listings/{listingId}/comments/{commentId}',
    secrets: [SENDGRID_API_KEY, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    initializeAdminIfNeeded();

    const comment = event.data?.data();
    const listingId = event.params?.listingId;

    if (!comment || !listingId) {
      logger.error('❌ Missing comment or listing ID');
      return;
    }

    const db = getFirestore();
    const listingSnap = await db.collection('listings').doc(listingId).get();

    if (!listingSnap.exists) {
      logger.error(`❌ Listing with ID ${listingId} not found`);
      return;
    }

    const listing = listingSnap.data();
    const toEmail = listing.ownerEmail;

    if (!toEmail) {
      logger.error('❌ No ownerEmail in listing');
      return;
    }

    sgMail.setApiKey(SENDGRID_API_KEY.value());

    const msg = {
      to: toEmail,
      from: 'noreply@myhome24app.com',
      subject: '📥 New comment received',
      text: `You received a new comment: ${comment.text}`,
      html: `<p><strong>You received a new comment:</strong><br>${comment.text}</p>`,
    };

    try {
      await sgMail.send(msg);
      logger.log(`✅ Email sent to: ${toEmail}`);
    } catch (error) {
      logger.error('❌ SendGrid error:', error?.response?.body || error);
    }
  }
);

// ---------------------------
// 📬 Funksioni për kontakt të ri
// ---------------------------
exports.sendNewContactNotificationFinalV2 = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'contacts/{contactId}',
    secrets: [SENDGRID_API_KEY, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    initializeAdminIfNeeded();

    const contact = event.data?.data();

    if (!contact || !contact.ownerEmail) {
      logger.error('❌ Missing contact data or ownerEmail');
      return;
    }

    sgMail.setApiKey(SENDGRID_API_KEY.value());

    const msg = {
      to: contact.ownerEmail,
      from: 'noreply@myhome24app.com',
      subject: `📨 New contact request: ${contact.listingTitle}`,
      text: `
You received a new message from ${contact.name} (${contact.email}):
${contact.message}
      `,
      html: `
        <p><strong>New contact from:</strong> ${contact.name} (${contact.email})</p>
        <p><strong>Message:</strong><br>${contact.message}</p>
        <p><strong>Listing:</strong> ${contact.listingTitle}</p>
      `
    };

    try {
      await sgMail.send(msg);
      logger.log(`✅ Contact email sent to: ${contact.ownerEmail}`);
    } catch (error) {
      logger.error('❌ SendGrid error:', error?.response?.body || error);
    }
  }
);
// ---------------------------

// ---------------------------
exports.sendRoleUpgradeRequestNotificationFinalV2 = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'roleUpgradeRequests/{requestId}',
    secrets: [
      SENDGRID_API_KEY,
      FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PROJECT_ID,
    ],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    initializeAdminIfNeeded();

    const requestData = event.data?.data();
    const requestId = event.params?.requestId;

    if (!requestData) {
      logger.error('❌ Missing roleUpgradeRequests data');
      return;
    }

    const {
      userId,
      fullName,
      email,
      targetRole,
      reason,
      requestedAt,
      source,
    } = requestData;

    // Fokus: vetëm kërkesa për "agent"
    if (targetRole !== 'agent') {
      logger.log(
        `[sendRoleUpgradeRequestNotificationFinalV2] targetRole=${targetRole}, skipping email (only "agent" handled).`
      );
      return;
    }

    // Konfiguro SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY.value());

    const requestDate = requestedAt?.toDate
      ? requestedAt.toDate().toLocaleString('de-DE')
      : 'kein Datum';

    const toEmail = DEFAULT_ADMIN_EMAIL; // admin-i që merr njoftimin

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
      to: toEmail,
      from: 'noreply@myhome24app.com', // sender që e ke tashmë te funksionet e tjera
      subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      await sgMail.send(msg);
      logger.log(
        `✅ Role upgrade email sent to admin for requestId=${requestId}, userId=${userId}`
      );
    } catch (error) {
      logger.error(
        '❌ SendGrid error in sendRoleUpgradeRequestNotificationFinalV2:',
        error?.response?.body || error
      );
    }
  }
);
