require("dotenv").config();
const path = require("path");

const express = require("express");

const redisClient = require("./src/config/redis");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/user", require("./src/routes/userRoutes"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await redisClient.connect();

        console.log("✅ Redis Connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ Failed to connect Redis:", error);
        process.exit(1);
    }
};

startServer();

// app.listen(PORT, () => {

//     console.log(`Server running on ${PORT}`);

// });