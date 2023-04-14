const express = require("express");
const app = express();
const hotels = require("./routes/hotels");
const menus = require("./routes/menus");
const mongoose = require("mongoose");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

var cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

mongoose
  .connect("mongodb://localhost:27017/MenuHub")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

app.use(express.json());
app.use("/api/hotels", hotels);
app.use("/api/menus", menus);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`App listening on port ${port}!`));
