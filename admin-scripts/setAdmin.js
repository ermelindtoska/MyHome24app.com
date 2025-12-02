// admin-scripts/setAdmin.js

const path = require("path");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

// .env.local aus dem Projekt-Root laden
dotenv.config({
  path: path.resolve(__dirname, "..", ".env.local"),
});

// Service-Account-Daten aus Umgebungsvariablen
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined,
};

// Sicherheitscheck
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error("❌ FIREBASE_ADMIN_* Variablen fehlen. Bitte .env.local prüfen!");
  console.error("FIREBASE_ADMIN_PROJECT_ID:", serviceAccount.projectId);
  console.error("FIREBASE_ADMIN_CLIENT_EMAIL:", serviceAccount.clientEmail);
  console.error(
    "FIREBASE_ADMIN_PRIVATE_KEY gesetzt?:",
    !!process.env.FIREBASE_ADMIN_PRIVATE_KEY
  );
  process.exit(1);
}

// Admin initialisieren
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

console.log("✅ Firebase Admin erfolgreich initialisiert.");
process.exit(0);
