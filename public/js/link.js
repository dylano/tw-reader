const linker = new Autolinker({ mention: "twitter" });
const allTweets = document.querySelectorAll(".tweetstr");
allTweets.forEach(el => {
  el.innerHTML = linker.link(el.innerHTML);
});
