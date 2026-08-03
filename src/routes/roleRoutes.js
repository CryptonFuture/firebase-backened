const express = require("express");

const router = express.Router();

const roleController = require("../controllers/roleController");

const verify = require("../middleware/verifyToken");

router.get("/roles", verify, roleController.getRoles);

module.exports = router;