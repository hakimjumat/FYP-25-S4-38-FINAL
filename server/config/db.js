const { admin } = require("./firebase");

// Get Firestore database instance
const db = admin.firestore();

module.exports = db;
