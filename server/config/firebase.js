// server/config/firebase.js

/// Firebase Admin SDK initialization used in:
// verifyToken.js - Verify JWT tokens from frontend
// userModel.js - Database operations
// gamificationModel.js - Points/badges operations
const admin = require("firebase-admin");
const fs = require("fs");

// The path where Google Cloud Run will mount your secret
const SECRET_PATH = "/secrets/firebase-key.json";
const LOCAL_PATH = "./config/serviceAccountKey.json";

let serviceAccount;

if (fs.existsSync(SECRET_PATH)) {
  // Use the secure secret from Google Cloud Run
  serviceAccount = require(SECRET_PATH);
  console.log("Firebase initialized using Cloud Run Secret.");
} else if (fs.existsSync(LOCAL_PATH)) {
  // Fallback for local development
  serviceAccount = require(LOCAL_PATH);
  console.log("Firebase initialized using local serviceAccountKey.json.");
} else {
  // If no key is found, try Application Default Credentials
  console.warn(
    "No service account file found. Attempting Application Default Credentials.",
  );
}

admin.initializeApp({
  credential: serviceAccount
    ? admin.credential.cert(serviceAccount)
    : admin.credential.applicationDefault(),
  // Replace with your actual project database URL if needed
  databaseURL: "https://learning-platform-aabbf.firebaseio.com",
});

module.exports = admin;
