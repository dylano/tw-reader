const express = require("express");
const TwData = require("./twdata");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const app = express();
const PORT = process.env.PORT || 3000;
const twData = new TwData();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

const dbconnect = process.env.MONGODB_URI || "mongodb://localhost/twreader";
console.log(`Connecting to Mongo: ${dbconnect}`);
mongoose.connect(dbconnect).catch(err => {
  console.log(`fatal: could not connect to mongo:\n${err}`);
  process.exit(1);
});

// ROUTES
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/user", (req, res) => {
  // twData.getTweet("971131048036839430");
  twData
    .getUserTweets("dtoliver", 3)
    .then(tweets => {
      res.render("user", { tweets });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/timeline", (req, res) => {
  // twData.loadTweets("dtoliver", 30);
  twData
    .getTimelineTweets()
    .then(tweets => {
      res.render("timeline", { tweets });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/friends", (req, res) => {
  twData
    .getFriends()
    .then(friends => {
      console.log(`friends = ${friends}`);
      res.render("friends", { friends });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/friends/:id", (req, res) => {
  try {
    twData.getFriend(req.params.id).then(friend => {
      twData.getTweetsByFriendId(friend.id).then(tweets => {
        res.render("friend", { friend, tweets });
      });
    });
    // res.send(`tweets for user ${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
});

app.post("/friends", (req, res) => {
  twData.loadFriends("dtoliver").then(() => {
    res.redirect("/friends");
  });
});

app.post("/timeline", (req, res) => {
  twData.loadTweets("dtoliver", 30).then(() => {
    res.redirect("/timeline");
  });
});

app.put("/tweets/:id", (req, res) => {
  twData.markTweetAsRead(req.params.id).then(() => {
    res.redirect("/timeline");
  });
});

app.listen(PORT, () => {
  console.log(`tw-reader listening on port ${PORT}...`);
});
