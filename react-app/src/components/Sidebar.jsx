/* eslint-disable no-underscore-dangle */
import React from 'react';
import './Sidebar.css';

function Sidebar({ friends, selectedFriend, onFriendSelect }) {
  const fList = friends.map((friend) => {
    let newTweetsStr = '';
    let unreadClass = '';
    if (friend.newTweetCount) {
      newTweetsStr = ` (${friend.newTweetCount})`;
      unreadClass = 'unread';
    }
    const label = `@${friend.screenName}${newTweetsStr}`;
    const className =
      friend._id === selectedFriend
        ? 'sidebar-friendlist-item selected'
        : `sidebar-friendlist-item ${unreadClass}`;
    return (
      <button
        type="button"
        className={className}
        key={friend._id}
        onClick={() => onFriendSelect(friend._id)}
      >
        {label}
      </button>
    );
  });
  return friends.length > 0 ? (
    <div className="sidebar sidebar-friendlist">{fList}</div>
  ) : (
    <div className="sidebar sidebar-loading">Loading...</div>
  );
}

export default Sidebar;
