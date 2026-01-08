const express = require("express");
const router = express.Router();
const internshipController = require("../controllers/internshipController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

// All routes require "internshipprovider" role
router.use(verifyToken);
router.use(checkRole(["internshipprovider", "admin"]));

router.post("/create", internshipController.createPosting);
router.get("/my-postings", internshipController.getMyPostings);
router.get("/:postingId/candidates", internshipController.getCandidates);

module.exports = router;
