const express = require("express");
const upload = require("../middleware/upload");

const router = express.Router();

const { signup, login, forgotPassword, verifyToken, signin, logout, signout, anonymousLogin } = require("../controllers/authController");

const verify = require("../middleware/verifyToken");

router.post("/signup", upload.array("image", 10), signup);

router.post("/login", login);

router.post("/signin", signin);

// router.post("/googleLogin", googleLogin)

router.post("/anonymous-login", anonymousLogin);

router.post("/logout", logout);

router.post("/signout", signout);

router.post("/forgot-password", forgotPassword);

router.get("/verify-token", verifyToken);

// router.get("/me", verify, auth.currentUser);

module.exports = router;