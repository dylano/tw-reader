require("newrelic");
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/apiRoutes");
const appRoutes = require("./routes/appRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(`${__dirname}/public`));
app.set("view engine", "ejs");

const dbconnect = process.env.MONGODB_URI || "mongodb://localhost/twreader";
console.log(`Connecting to Mongo: ${dbconnect}`);
mongoose.connect(dbconnect).catch(err => {
  console.log(`fatal: could not connect to mongo:\n${err}`);
  process.exit(1);
});

// ROUTES
app.use("/api", apiRoutes);
app.use("/", appRoutes);

app.listen(PORT, () => {
  console.log(`tw-reader listening on port ${PORT}...`);
});
