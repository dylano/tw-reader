const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
  id: String,
  screenName: String,
  name: String,
  imgUrl: String
});

module.exports = mongoose.model("Friend", FriendSchema);
