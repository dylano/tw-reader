const tweetItems = [...document.querySelectorAll('div li')];
let selectedIndex = -1;

const ACTION_READ = 'read';
const ACTION_SAVE = 'save';

function updateTweet(tweetId, action) {
  fetch(`/tweets/${tweetId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action })
  });
}

function saveItem(li) {
  // Toggle the selected state of the save indicator and trigger save call in DB
  const tweetId = li.getAttribute('data-key');
  const saveButton = li.querySelector('.saveitem');
  if (saveButton) {
    saveButton.classList.toggle('selected');
  }
  updateTweet(tweetId, ACTION_SAVE);
}

function markItemRead(li) {
  // remove list item from page and mark tweet as read in DB
  const tweetId = li.getAttribute('data-key');
  const ul = li.parentElement;
  const index = tweetItems.indexOf(li);
  tweetItems.splice(index, 1);
  li.remove();
  updateTweet(tweetId, ACTION_READ);

  // if there are no visible items left, hide the section
  let hasChildren = false;
  ul.childNodes.forEach(cnode => {
    if (!hasChildren && cnode.nodeName === 'LI') {
      hasChildren = true;
    }
  });
  if (!hasChildren) {
    ul.parentElement.remove();
  }
}

function markUserRead(div) {
  const screenName = div.getAttribute('data-key');
  fetch(`/friends/${screenName}`, { method: 'PUT' });

  // remove the elements from the tweetItems array
  const children = div.querySelectorAll('li');
  children.forEach(childItem => {
    const isTweetSaved = childItem.querySelector('.saveitem.selected');
    if (!isTweetSaved) {
      const index = tweetItems.indexOf(childItem);
      tweetItems.splice(index, 1);
      childItem.remove();
      if (selectedIndex >= index) {
        selectedIndex--;
        console.log(`new index: ${selectedIndex}`);
      }
    }
  });

  // Remove the user div if all children are gone
  const remainingChildren =  div.querySelectorAll('li');
  if(!remainingChildren.length) {
    div.remove();
  }

  // Adjust selected item if necessary
  if (selectedIndex < 0) {
    selectedIndex = 0;
  } else if (selectedIndex > tweetItems.length) {
    selectedIndex = tweetItems.length - 1;
  }
  tweetItems[selectedIndex].classList.add('selected');
}

function markReadItemClicked() {
  markItemRead(this.parentElement.parentElement.parentElement);
}

function saveItemClicked() {
  saveItem(this.parentElement.parentElement.parentElement);
  document.activeElement.blur();
}

function markReadUserClicked() {
  markUserRead(this.parentElement);
}

function showLoader() {
  const loader = document.querySelector('#load-animation');
  loader.classList.remove('not-loading');
  loader.classList.add('loading');
}

function processKeypress(event) {
  const keypress = event.key;
  if (keypress === '?') {
    // eslint-disable-next-line no-alert
    alert(
      `G - retrieve new tweets
      j / k - down/up
      o - open current on Twitter
      L - open URL embedded in tweet
      s - toggle save/unsave tweet
      x - mark tweet read
      X - mark all read for current user`
    );
  } else if (['j', 'k', 'l', 'L', 'o', 's', 'x', 'X', 'G', '-', '='].includes(keypress)) {
    // page actions
    if (keypress === 'G') {
      showLoader();
      document.querySelector('#btnNewTweets').submit();
    }

    // nav / item actions
    if (selectedIndex === -1) {
      selectedIndex = 0;
      tweetItems[selectedIndex].classList.add('selected');
    } else if (keypress === 'j' && selectedIndex < tweetItems.length - 1) {
      tweetItems[selectedIndex].classList.remove('selected');
      tweetItems[++selectedIndex].classList.add('selected');
    } else if (keypress === 'k' && selectedIndex > 0) {
      tweetItems[selectedIndex].classList.remove('selected');
      tweetItems[--selectedIndex].classList.add('selected');
    } else if (keypress === 'o') {
      tweetItems[selectedIndex].querySelector('.twitterlink').click();
    } else if (keypress === 's') {
      saveItem(tweetItems[selectedIndex]);
    } else if (keypress === 'x') {
      markItemRead(tweetItems[selectedIndex]);
      if (selectedIndex === tweetItems.length) {
        tweetItems[--selectedIndex].classList.add('selected');
      } else {
        tweetItems[selectedIndex].classList.add('selected');
      }
    } else if (keypress === 'X') {
      markUserRead(tweetItems[selectedIndex].parentElement.parentElement);
    } else if (keypress === 'l' || keypress === 'L') {
      const link = tweetItems[selectedIndex].querySelector('.autolink-url');
      if (link) {
        link.click();
      }
    }

    tweetItems[selectedIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

function highlightSelection() {
  // remove any existing highlight
  tweetItems.forEach(item => item.classList.remove('selected'));

  // create new highlight -- this is more complex than it should be because some
  // clicks are from the button to remove a tweet. So we need to check if the
  // row that generated this click still exists before we know what to highlight.
  const prevSelection = selectedIndex;
  selectedIndex = tweetItems.indexOf(this);
  if (selectedIndex >= 0) {
    // the simple case
    tweetItems[selectedIndex].classList.add('selected');
  } else if (selectedIndex === -1 && prevSelection !== -1) {
    // the delete case
    selectedIndex = prevSelection >= tweetItems.length ? tweetItems.length - 1 : prevSelection;
    tweetItems[selectedIndex].classList.add('selected');
  }
}

document.querySelectorAll('.markreaditem').forEach(btn => {
  btn.addEventListener('click', markReadItemClicked);
});

document.querySelectorAll('.markreaduser').forEach(btn => {
  btn.addEventListener('click', markReadUserClicked);
});

document.querySelectorAll('.saveitem').forEach(btn => {
  btn.addEventListener('click', saveItemClicked);
});

tweetItems.forEach(item => {
  item.addEventListener('click', highlightSelection);
});

document.querySelector('#btnNewTweets').addEventListener('click', showLoader);

window.addEventListener('keydown', processKeypress);
