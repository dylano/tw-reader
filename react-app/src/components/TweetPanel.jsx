/* eslint-disable no-underscore-dangle */
import React from 'react';
import ReactAutolinker from 'react-autolinker';
import './TweetPanel.css';

const autolinkerOptions = { className: 'autolinker' };

function TweetPanel({
  friend,
  tweets,
  onTweetRead,
  onTweetSave,
  onUserRead,
  showAllTweets = false,
}) {
  if (!showAllTweets) {
    tweets = tweets.filter((tweet) => !tweet.isRead);
  }

  let content;
  if (tweets.length === 0) {
    content = (
      <div className="tweet-panel-tweet tweet-panel-tweet-content">
        <span>No tweets have been twote.</span>
      </div>
    );
  } else {
    content = tweets
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((tweet) => {
        const tweetLink = `https://twitter.com/${friend.screenName}/status/${tweet.id}`;

        // Mark read action icon
        const markReadAction = tweet.isRead ? null : (
          <button
            type="button"
            className="tweet-action action-close"
            onClick={() => onTweetRead(tweet._id)}
          >
            <ion-icon name="close" style={{ color: 'orangered' }} />
          </button>
        );

        // Save action icon
        const iconName = tweet.isSaved ? 'star' : 'star-outline';
        const styleColor = tweet.isSaved ? 'yellow' : 'white';
        const saveAction = (
          <button
            type="button"
            className="tweet-action action-save"
            style={{ border: `1px solid ${styleColor}` }}
            onClick={() => onTweetSave(tweet._id, !tweet.isSaved)}
          >
            <ion-icon style={{ color: styleColor }} name={iconName} />
          </button>
        );

        // show similarity display if this looks like a duplicate tweet
        let similarityReport = '';
        if (tweet.similarity > 0.5) {
          similarityReport = (
            <div className="tweet-panel-tweet-similarity">
              ({tweet.similarity}) {tweet.similarityString}
            </div>
          );
        }

        let retweetUser = '';
        if (tweet.retweetUserName) {
          retweetUser = (
            <span className="retweet-user">@{tweet.retweetUserName}</span>
          );
        }

        return (
          <div className="tweet-panel-tweet" key={tweet._id}>
            <span className="tweet-action action-open action-left">
              <a href={tweetLink} target="_blank" rel="noopener noreferrer">
                <ion-icon name="logo-twitter" />
              </a>
            </span>
            <div className="tweet-panel-tweet-content">
              {retweetUser}
              <ReactAutolinker text={tweet.text} options={autolinkerOptions} />
              {similarityReport}
            </div>
            <div className="action-right action-stack">
              {markReadAction}
              {saveAction}
            </div>
          </div>
        );
      });
  }

  return (
    <div className="tweet-panel">
      <header className="tweet-panel-header">
        <div className="tweet-panel-header-title">
          <img
            className="tweet-panel-header-image"
            src={friend.imgUrl}
            alt={friend.name}
          />
          <span className="tweet-panel-header-name">{friend.name}</span>
        </div>
        <button
          type="button"
          className="tweet-panel-header-action"
          onClick={() => onUserRead(friend.screenName)}
        >
          Mark Read
        </button>
      </header>
      {content}
    </div>
  );
}

export default TweetPanel;
