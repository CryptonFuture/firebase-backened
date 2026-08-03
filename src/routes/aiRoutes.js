const router = require("express").Router();
const verify = require("../middleware/verifyToken");

const  askAI  = require("../controllers/aiController");

router.post("/chat", verify, askAI);

module.exports = router;