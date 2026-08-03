const express = require("express");

const router = express.Router();

const roleController = require("../controllers/roleController");

const verify = require("../middleware/verifyToken");

router.get("/roles", roleController.getRoles);

module.exports = router;