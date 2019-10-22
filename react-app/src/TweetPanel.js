import React from "react";
import PropTypes from "prop-types";
import ReactAutolinker from "react-autolinker";
import "./TweetPanel.css";

const autolinkerOptions = {className: "autolinker"};

const TweetPanel = ({friend, tweets, onTweetRead, onUserRead, showAllTweets = false}) => {
  if (!showAllTweets) {
    tweets = tweets.filter(tweet => !tweet.isRead);
  }

  let content;
  if (tweets.length === 0) {
    content = <div className="tweet-panel-tweet tweet-panel-tweet-content">No tweetz :(</div>;
  } else {
    content = tweets
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map(tweet => {
        const tweetClass = tweet.isRead
          ? "tweet-panel-tweet-content"
          : "tweet-panel-tweet-content tweet-panel-tweet-new";
        const tweetLink = `https://twitter.com/${friend.screenName}/status/${tweet.id}`;
        const markReadAction = tweet.isRead ? (
          <span />
        ) : (
          <span
            className="tweet-action action-close action-right"
            onClick={() => onTweetRead(tweet._id)}
          >
            <i className="far fa-check-circle" />
          </span>
        );

        // similarity display if this looks like a duplicate tweet
        // todo: add a property for similarity display threshold once we've done a test drive to decide on best value
        let similarityReport = "";
        if (tweet.similarity > 0.5) {
          similarityReport = (
            <div className="tweet-panel-tweet-similarity">
              ({tweet.similarity}) {tweet.similarityString}
            </div>
          );
        }

        let retweetUser = "";
        if (tweet.retweetUserName) {
          retweetUser = <span className="retweet-user">@{tweet.retweetUserName}</span>;
        }

        return (
          <div className="tweet-panel-tweet" key={tweet._id}>
            <span className="tweet-action action-open action-left">
              <a href={tweetLink} target="_blank" rel="noopener noreferrer">
                <i className="fas fa-dove" />
              </a>
            </span>
            <div className={tweetClass}>
              {retweetUser}
              <ReactAutolinker text={tweet.text} options={autolinkerOptions} />
              {similarityReport}
            </div>
            {markReadAction}
          </div>
        );
      });
  }
  return (
    <div className="tweet-panel">
      <header className="tweet-panel-header">
        <span className="tweet-panel-header-title">{friend.name}</span>
        <span className="tweet-panel-header-action" onClick={() => onUserRead(friend.screenName)}>
          Mark All Read
        </span>
      </header>
      {content}
    </div>
  );
};
TweetPanel.propTypes = {
  tweets: PropTypes.array.isRequired,
  friend: PropTypes.object.isRequired,
  onTweetRead: PropTypes.func.isRequired,
  onUserRead: PropTypes.func.isRequired,
  showAllTweets: PropTypes.bool
};

export default TweetPanel;
