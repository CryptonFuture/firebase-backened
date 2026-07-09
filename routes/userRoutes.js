const express = require("express");

const router = express.Router();

const { updateUserStatus, getUsers, deleteUser, getSingleUser } = require("../controllers/userController");

const verify = require("../middleware/verifyToken");

router.put("/status/:uid", updateUserStatus);
router.get("/users", getUsers);
router.get("/getSingleUser/:id", getSingleUser);
router.delete("/deleteUsers/:id", deleteUser);

module.exports = router;