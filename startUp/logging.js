const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");
const config = require("config");
const url = config.get("db");

module.exports = function () {
  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "uncaughtException.log" })
  );

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  winston.add(new winston.transports.File({ filename: "logfile.log" }));

  winston.add(new winston.transports.MongoDB({ db: url }));
};
