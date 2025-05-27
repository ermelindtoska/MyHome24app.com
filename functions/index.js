// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// 🔐 VENDOS KËTU API KEY nga SendGrid
sgMail.setApiKey("PASTE_KETU_SENDGRID_API_KEY");

exports.sendNewCommentNotification = functions.firestore
  .document("listings/{listingId}/comments/{commentId}")
  .onCreate(async (snap, context) => {
    const comment = snap.data();
    const listingId = context.params.listingId;

    const listingRef = admin.firestore().collection("listings").doc(listingId);
    const listingDoc = await listingRef.get();

    if (!listingDoc.exists) {
      console.log("Listing nuk u gjet.");
      return null;
    }

    const listing = listingDoc.data();
    const ownerEmail = listing.ownerEmail || null;

    if (!ownerEmail) {
      console.log("ownerEmail mungon në listing.");
      return null;
    }

    const msg = {
      to: ownerEmail,
      from: "noreply@myhome24app.com",
      subject: "Neuer Kommentar zu Ihrer Anzeige",
      text: `Ihre Anzeige "${listing.title}" hat einen neuen Kommentar:\n\n"${comment.text}"\n\nBesuchen Sie Ihr Dashboard, um den Kommentar zu sehen.`,
    };

    try {
      await sgMail.send(msg);
      console.log("Email u dërgua me sukses");
    } catch (error) {
      console.error("Gabim në dërgimin e emailit:", error);
    }

    return null;
  });
