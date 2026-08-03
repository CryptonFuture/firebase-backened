const express = require("express");

const router = express.Router();

const { getRoles } = require("../../src/controllers/roleController");

// const verify = require("../../src/middleware/verifyToken");

router.get("/roles", getRoles);

module.exports = router;