const admin = require("../config/firebase");
const userModel = require("../models/userModel");

/**
 * Middleware to verify Firebase ID token
 * Extracts user info and attaches to req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // Extract token
    const token = authHeader.split("Bearer ")[1];

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // get user role from Firestore
    const userProfile = await userModel.getUserById(decodedToken.uid);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userProfile?.role || "student", // get role from firestore
    };
    console.log(` VERIFIED: User ${decodedToken.email} is allowed.`);

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or expired token",
    });
  }
};

module.exports = verifyToken;
