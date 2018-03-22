const readButtons = document.querySelectorAll(".markread");
readButtons.forEach(btn => {
  btn.addEventListener("click", function(el) {
    // hide list item and mark tweet as read
    const li = this.parentElement;
    const tweetId = li.getAttribute("data-key");
    li.classList.add("hidden");
    fetch(`/tweets/${tweetId}`, { method: "put" });

    // if there are no visible items left, hide the section
    const ul = li.parentElement;
    console.log(ul);
    let hasChildren = false;

    ul.childNodes.forEach(cnode => {
      if (!hasChildren && cnode.nodeName === "LI") {
        hasChildren = !cnode.classList.contains("hidden");
      }
    });
    if (!hasChildren) {
      ul.parentElement.classList.add("hidden");
    }
  });
});
