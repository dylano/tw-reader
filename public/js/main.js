const tweetItems = [...document.querySelectorAll("div li")];
let selectedIndex = -1;

function markItemRead(li) {
  // hide list item and mark tweet as read
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

function markReadItemClicked() {
  markItemRead(this.parentElement);
}

function markReadUserClicked() {
  markUserRead(this.parentElement);
}

function markUserRead(div) {
  const screenName = div.getAttribute("data-key");
  div.classList.add("hidden");
  fetch(`/friends/${screenName}/tweets`, { method: "PUT" });

  // remove the elements from the tweetItems array and adjust the selection
  const children = div.querySelectorAll("li");
  children.forEach(child => {
    const index = tweetItems.indexOf(child);
    tweetItems.splice(index, 1);
    if (selectedIndex >= index) {
      selectedIndex--;
      console.log(`new index: ${selectedIndex}`);
    }
  });
  if (selectedIndex < 0) {
    selectedIndex = 0;
  } else if (selectedIndex > tweetItems.length) {
    selectedIndex = tweetItems.length - 1;
  }
  tweetItems[selectedIndex].classList.add("selected");
}

function swipeItem(el) {}

function processKeypress(event) {
  const keypress = event.key;
  if (keypress === "?") {
    alert(
      "j / k - down/up\nx - mark tweet read\nX - mark all read for current user"
    );
  } else if (["j", "k", "o", "x", "X"].includes(keypress)) {
    if (selectedIndex === -1) {
      selectedIndex = 0;
      tweetItems[selectedIndex].classList.add("selected");
    } else if (keypress === "j" && selectedIndex < tweetItems.length - 1) {
      tweetItems[selectedIndex].classList.remove("selected");
      tweetItems[++selectedIndex].classList.add("selected");
    } else if (keypress === "k" && selectedIndex > 0) {
      tweetItems[selectedIndex].classList.remove("selected");
      tweetItems[--selectedIndex].classList.add("selected");
    } else if (keypress === "o") {
      tweetItems[selectedIndex].querySelector(".twitterlink").click();
    } else if (keypress === "x") {
      markItemRead(tweetItems[selectedIndex]);
      tweetItems.splice(selectedIndex, 1);
      if (selectedIndex === tweetItems.length) {
        tweetItems[--selectedIndex].classList.add("selected");
      } else {
        tweetItems[selectedIndex].classList.add("selected");
      }
    } else if (keypress === "X") {
      markUserRead(tweetItems[selectedIndex].parentElement.parentElement);
    }
    tweetItems[selectedIndex].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

function highlightSelection() {
  if (selectedIndex >= 0) {
    tweetItems[selectedIndex].classList.remove("selected");
  }
  selectedIndex = tweetItems.indexOf(this);
  tweetItems[selectedIndex].classList.add("selected");
}

document.querySelectorAll(".markreaditem").forEach(btn => {
  btn.addEventListener("click", markReadItemClicked);
});

document.querySelectorAll(".markreaduser").forEach(btn => {
  btn.addEventListener("click", markReadUserClicked);
});

tweetItems.forEach(item => {
  item.addEventListener("click", highlightSelection);
});

window.addEventListener("keydown", processKeypress);
