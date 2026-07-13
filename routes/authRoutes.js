const express = require("express");

const router = express.Router();

const { signup, login, forgotPassword, verifyToken, signin, logout, signout } = require("../controllers/authController");

const verify = require("../middleware/verifyToken");

router.post("/signup", signup);

router.post("/login", login);

router.post("/signin", signin);

router.post("/logout", logout);

router.post("/signout", signout);

router.post("/forgot-password", forgotPassword);

router.get("/verify-token", verifyToken);

// router.get("/me", verify, auth.currentUser);

module.exports = router;