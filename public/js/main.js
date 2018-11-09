const tweetItems = [...document.querySelectorAll('div li')];
let selectedIndex = -1;

function markItemRead(li) {
  // remove list item from page and mark tweet as read in DB
  const tweetId = li.getAttribute('data-key');
  const ul = li.parentElement;
  const index = tweetItems.indexOf(li);
  tweetItems.splice(index, 1);
  li.remove();
  fetch(`/tweets/${tweetId}`, { method: 'put' });

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
  div.classList.add('hidden');
  fetch(`/friends/${screenName}`, { method: 'PUT' });

  // remove the elements from the tweetItems array and adjust the selection
  const children = div.querySelectorAll('li');
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
  tweetItems[selectedIndex].classList.add('selected');
}

function markReadItemClicked() {
  markItemRead(this.parentElement.parentElement);
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
    alert(
      'G - retrieve new tweets\nj / k - down/up\no - open current on Twitter\nL - open URL embedded in tweet\nx - mark tweet read\nX - mark all read for current user'
    );
  } else if (['j', 'k', 'l', 'L', 'o', 'x', 'X', 'G', '-', '='].includes(keypress)) {
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

tweetItems.forEach(item => {
  item.addEventListener('click', highlightSelection);
});

document.querySelector('#btnNewTweets').addEventListener('click', showLoader);

window.addEventListener('keydown', processKeypress);
