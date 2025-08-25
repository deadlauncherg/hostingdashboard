// index.js
const express = require("express");
const path = require("path");
const { connectDB } = require("./db");

const app = express();

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("login", { hostingName: "ChunkHost" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ ChunkHost Dashboard running at http://localhost:${PORT}`);
});
