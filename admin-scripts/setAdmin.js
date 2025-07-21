// admin-scripts/setAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'nVZOzrD6EHgKKiIO2Rbn9NZtE2o1'; // <-- zëvendësoje me UID-n tënd real

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ The admin role was set for the user with UID: ${uid}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error in setting roles:', error);
    process.exit(1);
  });
