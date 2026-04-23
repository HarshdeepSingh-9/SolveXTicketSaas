const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const { seedIfEmpty } = require("./seed/seed");

async function startServer() {
  try {
    const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/407";
    await mongoose.connect(MONGO_URL);
    await seedIfEmpty();
    const PORT = Number(process.env.PORT || 8080);
    app.listen(PORT);
  } catch (error) {
    process.exit(1);
  }
}

startServer();