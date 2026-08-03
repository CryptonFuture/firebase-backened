const router = require("express").Router();
const verify = require("../middleware/verifyToken");

const aiControllers = require("../controllers/aiController");

router.post("/chat", verify, aiControllers.askAI);

module.exports = router;