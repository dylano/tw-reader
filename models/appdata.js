const mongoose = require("mongoose");

const AppDataSchema = new mongoose.Schema({
  screenName: String,
  mostRecentTweet: String
});

module.exports = mongoose.model("AppData", AppDataSchema);
