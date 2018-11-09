/* global Autolinker */
const linker = new Autolinker({ mention: 'twitter', className: 'autolink' });
const allTweets = document.querySelectorAll('.tweetstr');
allTweets.forEach(el => {
  el.innerHTML = linker.link(el.innerHTML);
});
