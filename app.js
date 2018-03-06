const express = require("express");
const TwData = require("./twdata");

const app = express();
const PORT = process.env.PORT || 3000;
const twData = new TwData();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/user", (req, res) => {
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
  // twData.getTweet("925952808724996096");
  twData
    .getHomeTweets("dtoliver", 3)
    .then(tweets => {
      res.render("timeline", { tweets });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/friends", (req, res) => {
  twData
    .getFriends("dtoliver")
    .then(friends => {
      res.render("friends", { friends });
    })
    .catch(err => {
      console.log(err);
    });
});

app.listen(PORT, () => {
  console.log(`tw-reader listening on port ${PORT}...`);
});
