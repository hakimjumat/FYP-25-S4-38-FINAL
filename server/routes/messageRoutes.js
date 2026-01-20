const express = require("express");
const router = express.Router();
const messageCtrl = require("../controllers/messagesController")
const verifyToken = require("../middleware/verifyToken");

// All routes require authentication
router.use(verifyToken);

router.get("/getAllYourMsgs", messageCtrl.getMyMessages);

router.post("/sendMessage", messageCtrl.sendMessage);

router.get("/getMsgRecivers", messageCtrl.getReciverUser)

module.exports = router;