const express = require("express");
const app = express();

require("./startUp/routes")(app);
require("./startUp/db")();
require("./startUp/config")();
require("./startUp/logging")();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
