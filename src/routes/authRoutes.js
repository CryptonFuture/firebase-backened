const express = require("express");
const upload = require('../middleware/upload')

const router = express.Router();

const authController = require("../controllers/authController");

const verify = require("../middleware/verifyToken");

router.post("/signup", upload.array("image", 10), authController.signup);

router.post("/login", authController.login);

router.post("/signin", authController.signin);

router.post("/signout", authController.signout);

router.post("/forgot-password", authController.forgotPassword);

router.get("/verify-token", authController.verifyToken);

// router.get("/me", verify, auth.currentUser);

module.exports = router;