const express = require("express");
const TwData = require("./helpers/twdata");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/apiRoutes");
const appRoutes = require("./routes/appRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const twData = new TwData();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static("public"));
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

app.post("/friends", (req, res) => {
  twData.loadFriends("dtoliver").then(() => {
    res.redirect("/friends");
  });
});

app.post("/timeline", (req, res) => {
  twData.loadTweets("dtoliver", 100).then(() => {
    res.redirect("/timeline");
  });
});

app.post("/main", (req, res) => {
  twData.loadTweets("dtoliver", 100).then(() => {
    res.redirect("/main");
  });
});

app.put("/tweets/:id", (req, res) => {
  twData.markTweetAsRead(req.params.id).then(() => {
    if (req.query.dest) {
      res.redirect(`/${req.query.dest}`);
    } else {
      res.sendStatus(200);
    }
  });
});

app.put("/friends/:screenName/tweets", (req, res) => {
  console.log(`mark read ${req.params.screenName}`);
  twData.markAllTweetsAsRead(req.params.screenName).then(() => {
    if (req.query.dest) {
      res.redirect(`/${req.query.dest}`);
    } else {
      res.sendStatus(200);
    }
  });
});

app.listen(PORT, () => {
  console.log(`tw-reader listening on port ${PORT}...`);
});
