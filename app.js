const express = require("express");
const twreader = require("./twitter");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/user", (req, res) => {
  twreader.getUserTimeline();
  res.render("user");
});

app.get("/timeline", (req, res) => {
  res.render("timeline");
});

app.get("/friends", (req, res) => {
  twreader
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
