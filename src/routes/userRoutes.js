const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const verify = require("../middleware/verifyToken");

router.put("/status/:uid", verify, userController.updateUserStatus);
router.get("/users", verify, userController.getUsers);
router.get("/getSingleUser/:id", verify, userController.getSingleUser);
router.get("/editUser/:id", verify, userController.editUser);
router.put("/updateUser/:uid", verify, userController.updateUser);
router.delete("/deleteUsers/:id", verify, userController.deleteUser);
router.get("/getActiveUsers", verify, userController.getActiveUsers);
router.get("/getInactiveUsers", verify, userController.getInactiveUsers);
router.get("/getUsersByStatus", verify, userController.getUsersByStatus)


module.exports = router;