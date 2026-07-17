require("dotenv").config();
const path = require("path");

const express = require("express");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on ${PORT}`);

});