function markItemRead(el) {
  // hide list item and mark tweet as read
  const li = this.parentElement;
  const tweetId = li.getAttribute("data-key");
  li.classList.add("hidden");
  fetch(`/tweets/${tweetId}`, { method: "put" });

  // if there are no visible items left, hide the section
  const ul = li.parentElement;
  let hasChildren = false;
  ul.childNodes.forEach(cnode => {
    if (!hasChildren && cnode.nodeName === "LI") {
      hasChildren = !cnode.classList.contains("hidden");
    }
  });
  if (!hasChildren) {
    ul.parentElement.classList.add("hidden");
  }
}

function markUserRead(el) {
  const div = this.parentElement;
  const screenName = div.getAttribute("data-key");
  div.classList.add("hidden");
  fetch(`/friends/${screenName}/tweets`, { method: "PUT" });
}

document.querySelectorAll(".markreaditem").forEach(btn => {
  btn.addEventListener("click", markItemRead);
});

document.querySelectorAll(".markreaduser").forEach(btn => {
  btn.addEventListener("click", markUserRead);
});
