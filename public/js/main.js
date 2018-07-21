const tweetItems = [...document.querySelectorAll("div li")];
let selectedIndex = -1;

function markItemRead(li) {
  // remove list item from page and mark tweet as read in DB
  const tweetId = li.getAttribute("data-key");
  const ul = li.parentElement;
  li.remove();
  fetch(`/tweets/${tweetId}`, { method: "put" });

  // if there are no visible items left, hide the section
  let hasChildren = false;
  ul.childNodes.forEach(cnode => {
    if (!hasChildren && cnode.nodeName === "LI") {
      hasChildren = true;
    }
  });
  if (!hasChildren) {
    ul.parentElement.remove();
  }
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
  div.remove();
  if (selectedIndex < 0) {
    selectedIndex = 0;
  } else if (selectedIndex > tweetItems.length) {
    selectedIndex = tweetItems.length - 1;
  }
  tweetItems[selectedIndex].classList.add("selected");
}

function markReadItemClicked() {
  markItemRead(this.parentElement);
}

function markReadUserClicked() {
  markUserRead(this.parentElement);
}

function processKeypress(event) {
  const keypress = event.key;
  if (keypress === "?") {
    alert(
      "G - retrieve new tweets\nj / k - down/up\no - open current on Twitter\nx - mark tweet read\nX - mark all read for current user"
    );
  } else if (["j", "k", "o", "x", "X", "G", "-", "="].includes(keypress)) {
    // page actions
    if (keypress === "G") {
      showLoader();
      document.querySelector("#btnNewTweets").submit();
    } else if (keypress === "-") {
      document.querySelector("#font-down").click();
    } else if (keypress === "=") {
      document.querySelector("#font-up").click();
    }

    // nav / item actions
    console.log(
      `pre -- selected index:${selectedIndex}, tweetItems.length:${
        tweetItems.length
      }`
    );
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
    console.log(
      `post -- selected index:${selectedIndex}, tweetItems.length:${
        tweetItems.length
      }`
    );

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

function showLoader() {
  const loader = document.querySelector("#load-animation");
  loader.classList.remove("not-loading");
  loader.classList.add("loading");
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

document.querySelector("#btnNewTweets").addEventListener("click", showLoader);

window.addEventListener("keydown", processKeypress);
