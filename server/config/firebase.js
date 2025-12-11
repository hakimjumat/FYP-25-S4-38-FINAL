// server/config/firebase.js

/// Firebase Admin SDK initialization used in:
// verifyToken.js - Verify JWT tokens from frontend
// userModel.js - Database operations
// gamificationModel.js - Points/badges operations
const admin = require("firebase-admin");
const path = require("path");

//if firebase is aleady initialized, use that one to prevent init error
if (!admin.apps.length) {
  try {
    const serviceAccount = require(path.join(
      __dirname,
      "../serviceAccountKey.json"
    ));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error(" Failed to initialize Firebase Admin:", error.message);
    process.exit(1); // stop the server if DB connection fails
  }
}

//export initialized admin instance directly
module.exports = admin;
