const { createClient } = require("redis");
const dotenv = require('dotenv')

dotenv.config()

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
    console.log("✅ Redis Connected");
});

redisClient.on("error", (err) => {
    console.error("❌ Redis Error:", err);
});

module.exports = redisClient;