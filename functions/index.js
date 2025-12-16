/* eslint-disable */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

// ✅ Wichtig: klassisches admin-Objekt -> am stabilsten (verhindert "default app does not exist")
const admin = require("firebase-admin");

// 🔐 Secrets
const FIREBASE_PRIVATE_KEY = defineSecret("FIREBASE_PRIVATE_KEY");
const FIREBASE_CLIENT_EMAIL = defineSecret("FIREBASE_CLIENT_EMAIL");
const FIREBASE_PROJECT_ID = defineSecret("FIREBASE_PROJECT_ID");
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");

// Defaults
const DEFAULT_ADMIN_EMAIL = "kontakt@myhome24app.com";
const FROM_EMAIL = "noreply@myhome24app.com"; // muss in SendGrid verifiziert sein

// -------------------------------------------------------
// ✅ Robust Admin Init (cert via Secrets + Fallback)
// -------------------------------------------------------
function initializeAdminIfNeeded() {
  if (admin.apps && admin.apps.length) return;

  try {
    const projectId = FIREBASE_PROJECT_ID.value();
    const clientEmail = FIREBASE_CLIENT_EMAIL.value();
    const privateKey = FIREBASE_PRIVATE_KEY.value()?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin secrets (projectId/clientEmail/privateKey).");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    logger.log("✅ Admin initialized with cert() secrets");
  } catch (e) {
    logger.warn("⚠️ Admin init with cert failed -> fallback initializeApp()", e);
    // In Cloud Functions reicht das oft (Default Credentials)
    admin.initializeApp();
    logger.log("✅ Admin initialized (default credentials)");
  }
}

// -------------------------------------------------------
// ✅ SendGrid init helper
// -------------------------------------------------------
function initSendgrid() {
  const key = SENDGRID_API_KEY.value();
  if (!key) throw new Error("Missing SENDGRID_API_KEY secret");
  sgMail.setApiKey(key);
}

// -------------------------------------------------------
// 📬 1) Kontakt-Notification (dein bestehendes Verhalten)
// Trigger: contacts/{contactId}
// -------------------------------------------------------
exports.sendNewContactNotificationFinalV2 = onDocumentCreated(
  {
    region: "us-central1",
    document: "contacts/{contactId}",
    secrets: [SENDGRID_API_KEY, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID],
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      initializeAdminIfNeeded();
      initSendgrid();

      const contact = event.data?.data();
      if (!contact) {
        logger.error("❌ Missing contact data");
        return;
      }

      const db = admin.firestore();

      // 1) Typ bestimmen
      const isAgentContact =
        contact.category === "agent-contact" || contact.source === "agent-profile";

      const isListingContact =
        !!contact.listingId ||
        !!contact.listingTitle ||
        contact.source === "listingDetailsModal" ||
        contact.source === "contactOwnerModal";

      // 2) ownerEmail sauber ermitteln
      let resolvedOwnerEmail = contact.ownerEmail || null;

      if (isListingContact && !resolvedOwnerEmail && contact.listingId) {
        try {
          const listingSnap = await db.collection("listings").doc(contact.listingId).get();
          if (listingSnap.exists) {
            const listingData = listingSnap.data();
            resolvedOwnerEmail =
              listingData?.ownerEmail || listingData?.email || listingData?.userEmail || null;
          }
        } catch (e) {
          logger.error("❌ Could not resolve ownerEmail from listing:", e);
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
        logger.error("❌ No target email found");
        return;
      }

      const senderName = contact.name || "Unbekannt";
      const senderEmail = contact.email || "keine Angabe";
      const subjectFromForm = (contact.subject || "").trim();

      const baseSubjectAgent = "Neue Nachricht über dein Makler:innenprofil";
      const baseSubjectDefault = "Neue Kontaktanfrage über MyHome24App";

      const subject =
        "📨 " +
        (isAgentContact ? baseSubjectAgent : baseSubjectDefault) +
        (subjectFromForm ? ` – ${subjectFromForm}` : "");

      const listingInfoText = contact.listingTitle ? `\nBezug: ${contact.listingTitle}\n` : "";

      const infoText = isAgentContact
        ? "Die Nachricht wurde über das öffentliche Makler:innenprofil auf MyHome24App gesendet."
        : "Die Nachricht wurde über das allgemeine Kontaktformular auf MyHome24App gesendet.";

      const textBody = `
${isAgentContact ? "Hallo Makler:in," : "Hallo MyHome24App-Team,"}

es ist eine neue Nachricht eingegangen.

Von: ${senderName} (${senderEmail})
Telefon: ${contact.phone || "—"}
${listingInfoText}
Nachricht:
${contact.message || ""}

${infoText}

Viele Grüße
MyHome24App – Systembenachrichtigung
      `.trim();

      const listingInfoHtml = contact.listingTitle
        ? `<p><strong>Bezug:</strong> ${contact.listingTitle}</p>`
        : "";

      const infoHtml = isAgentContact
        ? "<p>Diese Nachricht wurde über dein öffentliches Makler:innenprofil auf <strong>MyHome24App</strong> gesendet.</p>"
        : "<p>Diese Nachricht wurde über das allgemeine Kontaktformular auf <strong>MyHome24App</strong> gesendet.</p>";

      const msg = {
        to: targetEmail,
        from: FROM_EMAIL,
        replyTo: contact.email || undefined,
        subject,
        text: textBody,
        html: `
          <p>${isAgentContact ? "Hallo Makler:in," : "Hallo MyHome24App-Team,"}</p>
          <p>es ist eine neue Nachricht eingegangen.</p>

          <p><strong>Von:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>Telefon:</strong> ${contact.phone || "—"}</p>

          ${listingInfoHtml}

          <p><strong>Nachricht:</strong><br/>${(contact.message || "")
            .toString()
            .replace(/\n/g, "<br/>")}</p>

          ${infoHtml}

          <p>Viele Grüße<br/>MyHome24App – Systembenachrichtigung</p>
        `,
      };

      await sgMail.send(msg);

      logger.log(
        `✅ Contact email sent to: ${targetEmail} (isAgentContact=${isAgentContact}, category=${contact.category || "-"}, source=${contact.source || "-"})`
      );
    } catch (error) {
      logger.error("❌ SendGrid error (sendNewContactNotificationFinalV2):", error?.response?.body || error);
    }
  }
);

// -------------------------------------------------------
// 📩 2) Reply E-Mail vom Owner an Interessent:in
// Trigger: contacts/{contactId}/replies/{replyId}
// -------------------------------------------------------
exports.sendContactReplyEmailFinalV2 = onDocumentCreated(
  {
    region: "us-central1",
    document: "contacts/{contactId}/replies/{replyId}",
    secrets: [SENDGRID_API_KEY, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID],
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      initializeAdminIfNeeded();
      initSendgrid();

      const reply = event.data?.data();
      const contactId = event.params?.contactId;
      const replyId = event.params?.replyId;

      if (!reply || !contactId) {
        logger.error("❌ Missing reply data or contactId", { contactId, replyId });
        return;
      }

      const db = admin.firestore();

      // Parent contact laden
      const contactSnap = await db.collection("contacts").doc(contactId).get();
      if (!contactSnap.exists) {
        logger.error(`❌ Contact ${contactId} not found`);
        return;
      }

      const contact = contactSnap.data();

      // Zieladresse: Interessent:in
      const toEmail = contact?.email;
      if (!toEmail) {
        logger.error("❌ contact.email missing -> cannot send reply email", { contactId });
        return;
      }

      const listingTitle = contact?.listingTitle ? ` – ${contact.listingTitle}` : "";
      const subject = `📩 Antwort auf deine Anfrage${listingTitle}`;

      const ownerEmail = reply?.ownerEmail || contact?.ownerEmail || DEFAULT_ADMIN_EMAIL;

      const textBody = `
Hallo,

du hast eine Antwort auf deine Anfrage erhalten.

Bezug: ${contact?.listingTitle || "-"}
Deine Nachricht:
${contact?.message || "-"}

Antwort:
${reply?.message || "-"}

Viele Grüße
MyHome24App
      `.trim();

      const htmlBody = `
        <p>Hallo,</p>
        <p>du hast eine Antwort auf deine Anfrage erhalten.</p>

        <p><strong>Bezug:</strong> ${contact?.listingTitle || "-"}</p>

        <p><strong>Deine Nachricht:</strong><br/>${(contact?.message || "-")
          .toString()
          .replace(/\n/g, "<br/>")}</p>

        <hr/>

        <p><strong>Antwort:</strong><br/>${(reply?.message || "-")
          .toString()
          .replace(/\n/g, "<br/>")}</p>

        <p>Viele Grüße<br/>MyHome24App</p>
      `;

      // ✅ Optional aber super wichtig für DEIN "Kontaktfragen im Profil":
      // Parent-Contact updaten, damit UI es ohne Subcollection-Lesen schnell anzeigen kann
      await db.collection("contacts").doc(contactId).set(
        {
          lastReplyAt: admin.firestore.FieldValue.serverTimestamp(),
          lastReplyMessage: reply?.message || "",
          lastReplyOwnerEmail: ownerEmail || null,
          replyCount: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );

      const msg = {
        to: toEmail,
        from: FROM_EMAIL,
        replyTo: ownerEmail || undefined,
        subject,
        text: textBody,
        html: htmlBody,
      };

      await sgMail.send(msg);

      logger.log("✅ Reply email sent", { toEmail, contactId, replyId, ownerEmail });
    } catch (error) {
      logger.error("❌ SendGrid/Function error (sendContactReplyEmailFinalV2):", error?.response?.body || error);
    }
  }
);

// -------------------------------------------------------
// 📧 3) Role Upgrade Request (agent)
// Trigger: roleUpgradeRequests/{requestId}
// -------------------------------------------------------
exports.sendRoleUpgradeRequestNotificationFinalV2 = onDocumentCreated(
  {
    region: "us-central1",
    document: "roleUpgradeRequests/{requestId}",
    secrets: [SENDGRID_API_KEY, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID],
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      initializeAdminIfNeeded();
      initSendgrid();

      const requestData = event.data?.data();
      const requestId = event.params?.requestId;

      if (!requestData) {
        logger.error("❌ Missing roleUpgradeRequests data");
        return;
      }

      const { userId, fullName, email, targetRole, reason, requestedAt, source } = requestData;

      if (targetRole !== "agent") {
        logger.log(`[sendRoleUpgradeRequestNotificationFinalV2] targetRole=${targetRole}, skipping (only "agent").`);
        return;
      }

      const requestDate = requestedAt?.toDate
        ? requestedAt.toDate().toLocaleString("de-DE")
        : "kein Datum";

      const subject = "Neue Rollenfreigabe-Anfrage als Makler:in";

      const textBody = `
Hallo Admin-Team,

es liegt eine neue Anfrage zur Rollenfreigabe als Makler:in vor.

Benutzer-ID: ${userId || "-"}
Name:       ${fullName || "-"}
E-Mail:     ${email || "-"}

Zielrolle:  ${targetRole || "-"}
Quelle:     ${source || "-"}
Grund:      ${reason || "-"}
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
          <li><strong>Benutzer-ID:</strong> ${userId || "-"}</li>
          <li><strong>Name:</strong> ${fullName || "-"}</li>
          <li><strong>E-Mail:</strong> ${email || "-"}</li>
        </ul>

        <h3>Anfrage</h3>
        <ul>
          <li><strong>Zielrolle:</strong> ${targetRole || "-"}</li>
          <li><strong>Quelle:</strong> ${source || "-"}</li>
          <li><strong>Grund:</strong> ${reason || "-"}</li>
          <li><strong>Angefragt am:</strong> ${requestDate}</li>
        </ul>

        <p>Bitte prüft die Angaben im <strong>Admin-Dashboard</strong> (Bereich Rollen / Agenten)
        und entscheidet über Freigabe oder Ablehnung.</p>

        <p>Viele Grüße,<br/>MyHome24App – Systembenachrichtigung</p>
      `;

      await sgMail.send({
        to: DEFAULT_ADMIN_EMAIL,
        from: FROM_EMAIL,
        subject,
        text: textBody,
        html: htmlBody,
      });

      logger.log(`✅ Role upgrade email sent to admin (requestId=${requestId}, userId=${userId})`);
    } catch (error) {
      logger.error("❌ SendGrid error (sendRoleUpgradeRequestNotificationFinalV2):", error?.response?.body || error);
    }
  }
);
