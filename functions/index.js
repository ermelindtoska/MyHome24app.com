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
