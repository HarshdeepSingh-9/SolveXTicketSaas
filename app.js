
const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // parses JSON bodies
app.use(express.urlencoded({ extended: true })); // parses form-urlencoded


const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});


const PORT = 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
