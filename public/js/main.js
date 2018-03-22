const readButtons = document.querySelectorAll(".markread");
readButtons.forEach(btn => {
  btn.addEventListener("click", function(el) {
    // hide list item and mark tweet as read
    const li = this.parentElement;
    const tweetId = li.getAttribute("data-key");
    li.classList.add("hidden");
    fetch(`/tweets/${tweetId}`, { method: "put" });
  });
});
