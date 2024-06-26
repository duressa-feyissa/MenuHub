const mongoose = require("mongoose");
const config = require("config");
const url = config.get("db");
const options = { useNewUrlParser: true, useUnifiedTopology: true };

module.exports = function () {
  mongoose
    .connect(url, options)
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Failed to connect to MongoDB:", err));
};
