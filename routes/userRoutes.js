const express = require("express");

const router = express.Router();

const { updateUserStatus } = require("../controllers/userController");

const verify = require("../middleware/verifyToken");

router.put("/status/:uid", updateUserStatus);

module.exports = router;