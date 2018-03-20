const allTweets = document.getElementsByClassName("tweetstr");
for (let i = 0; i < allTweets.length; i++) {
  allTweets[i].innerHTML = Autolinker.link(allTweets[i].innerHTML);
}
