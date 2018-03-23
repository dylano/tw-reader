const tweetItems = [...document.querySelectorAll("div li")]; // […document.querySelectorAll(‘.divy’)]
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

function markReadClicked(el) {
  markItemRead(this.parentElement);
}

function markUserRead(el) {
  const div = this.parentElement;
  const screenName = div.getAttribute("data-key");
  div.classList.add("hidden");
  fetch(`/friends/${screenName}/tweets`, { method: "PUT" });
}

function select() {
  this.classList.toggle("selected");
}

function processKeypress(event) {
  const keypress = event.key.toLowerCase();
  if (keypress === "?") {
    alert("Navigation: \nJ/K - down/up\nX - delete");
  } else if (["j", "k", "o", "x"].includes(keypress)) {
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
      console.log(
        `delete ${
          tweetItems[selectedIndex]
        }; selectedIndex = ${selectedIndex}; tweetItems.length=${
          tweetItems.length
        }`
      );
      markItemRead(tweetItems[selectedIndex]);
      tweetItems.splice(selectedIndex, 1);
      if (selectedIndex === tweetItems.length) {
        console.log(
          `selectedIndex = ${selectedIndex}; tweetItems.length = ${
            tweetItems.length
          }`
        );
        tweetItems[--selectedIndex].classList.add("selected");
      } else {
        tweetItems[selectedIndex].classList.add("selected");
      }
    }
    tweetItems[selectedIndex].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

document.querySelectorAll(".markreaditem").forEach(btn => {
  btn.addEventListener("click", markReadClicked);
});

document.querySelectorAll(".markreaduser").forEach(btn => {
  btn.addEventListener("click", markUserRead);
});

tweetItems.forEach(item => {
  item.addEventListener("click", function(e) {
    if (selectedIndex >= 0) {
      tweetItems[selectedIndex].classList.remove("selected");
    }
    selectedIndex = tweetItems.indexOf(this);
    tweetItems[selectedIndex].classList.add("selected");
  });
});

window.addEventListener("keydown", processKeypress);
