const linker = new Autolinker();
const allTweets = document.querySelectorAll(".tweetstr");
allTweets.forEach(el => {
  el.innerHTML = linker.link(el.innerHTML);
});
