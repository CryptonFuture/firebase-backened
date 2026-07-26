const express = require("express");

const router = express.Router();

const { updateUserStatus, getUsers, deleteUser, getSingleUser, getActiveUsers, getInactiveUsers, getUsersByStatus } = require("../../src/controllers/userController");

const verify = require("../../src/middleware/verifyToken");

router.put("/status/:uid", verify, updateUserStatus);
router.get("/users", verify, getUsers);
router.get("/getSingleUser/:id", verify, getSingleUser);
router.delete("/deleteUsers/:id", verify, deleteUser);
router.get("/getActiveUsers", verify, getActiveUsers);
router.get("/getInactiveUsers", verify, getInactiveUsers);
router.get("/getUsersByStatus", verify, getUsersByStatus)


module.exports = router;