const functions = require('firebase-functions/v2');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// Inicializo Firebase Admin
admin.initializeApp();

// Merr API key nga secrets
const SENDGRID_API_KEY = defineSecret('SENDGRID_API_KEY');

// Funksioni që dërgon email pas komentit të ri
exports.sendNewCommentNotificationFinalV2 = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'listings/{listingId}/comments/{commentId}',
    secrets: [SENDGRID_API_KEY],
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    const comment = event.data?.data();
    const listingId = event.params?.listingId;

    if (!comment || !listingId) {
      logger.error('❌ Missing comment or listing ID');
      return;
    }

    const listingSnap = await admin.firestore().collection('listings').doc(listingId).get();
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
