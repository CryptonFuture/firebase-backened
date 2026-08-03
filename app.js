require("dotenv").config();
const path = require('path')

const express = require("express");

// const redisClient = require("./src/config/redis");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/user", require("./src/routes/userRoutes"));
app.use("/api/role", require("./src/routes/roleRoutes"));
app.use("/api/ai", require("./src/routes/aiRoutes"));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const ports = {
//   development: process.env.PORT_DEVELOPMENT,
//   staging: process.env.PORT_STAGING,
//   production: process.env.PORT_PRODUCTION
// };

// const NODE_ENV = process.env.NODE_ENV || "development";

// const PORT = ports[NODE_ENV];

// app.get("/", (req, res) => {
//   res.json({
//     environment: process.env.NODE_ENV,
//     port: PORT,
//   });
// });

// const startServer = async () => {
//     try {
//         await redisClient.connect();

//         console.log("✅ Redis Connected");

//         app.listen(PORT, "0.0.0.0", () => {
//             console.log(`🚀 Server running on port ${PORT}`);
//         });

//     } catch (error) {
//         console.error("❌ Failed to connect Redis:", error);
//         process.exit(1);
//     }
// };

// startServer();

<<<<<<< Updated upstream
const port = process.env.PORT

app.listen(port, () => {

    console.log(`Server running on ${port}`);

=======
app.listen(PORT, () => {

    console.log(`Server running on ${PORT}`);

>>>>>>> Stashed changes
});