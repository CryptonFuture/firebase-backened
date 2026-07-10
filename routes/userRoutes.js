const express = require("express");

const router = express.Router();

const { updateUserStatus, getUsers, deleteUser, getSingleUser, getActiveUsers, getInactiveUsers, getUsersByStatus } = require("../controllers/userController");

const verify = require("../middleware/verifyToken");

router.put("/status/:uid", updateUserStatus);
router.get("/users", getUsers);
router.get("/getSingleUser/:id", getSingleUser);
router.delete("/deleteUsers/:id", deleteUser);
router.get("/getActiveUsers", getActiveUsers);
router.get("/getInactiveUsers", getInactiveUsers);
router.get("/getUsersByStatus", getUsersByStatus)


module.exports = router;