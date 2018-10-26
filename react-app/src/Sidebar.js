import React from "react";
import PropTypes from "prop-types";
import "./Sidebar.css";

const Sidebar = ({ friends, selectedFriend, onFriendSelect }) => {
  const fList = friends.map(friend => {
    const newTweetsStr = friend.newTweetCount ? ` (${friend.newTweetCount})` : ``;
    const label = `@${friend.screenName}${newTweetsStr}`;
    const className = friend._id === selectedFriend ? "sidebar-friendlist-item selected" : "sidebar-friendlist-item";
    return (
      <div className={className} key={friend._id} onClick={() => onFriendSelect(friend._id)}>
        {label}
      </div>
    );
  });
  return friends.length > 0 ? (
    <div className="sidebar sidebar-friendlist">{fList}</div>
  ) : (
    <div className="sidebar sidebar-loading">Loading...</div>
  );
};
Sidebar.propTypes = {
  friends: PropTypes.array.isRequired,
  onFriendSelect: PropTypes.func.isRequired,
  selectedFriend: PropTypes.string
};

export default Sidebar;
