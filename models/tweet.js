const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  id: String,
  text: String,
  timestamp: Date,
  isRead: Boolean,
  userId: String,
  userName: String,
  userScreenName: String,
  retweetUserName: String,
  similarity: Number,
  similarityString: String,
  isSaved: Boolean
});

module.exports = mongoose.model("Tweet", tweetSchema);
