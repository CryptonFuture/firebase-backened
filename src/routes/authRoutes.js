const express = require("express");

const router = express.Router();

const { signup, login, forgotPassword, verifyToken, signin } = require("../controllers/authController");

const verify = require("../middleware/verifyToken");

router.post("/signup", upload.array("image", 10), signup);

router.post("/login", login);

router.post("/signin", signin);

router.post("/forgot-password", forgotPassword);

router.get("/verify-token", verifyToken);

// router.get("/me", verify, auth.currentUser);

module.exports = router;