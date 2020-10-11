import React from 'react';
import PropTypes from 'prop-types';
import ReactAutolinker from 'react-autolinker';
import './TweetPanel.css';

const autolinkerOptions = { className: 'autolinker' };

const TweetPanel = ({ friend, tweets, onTweetRead, onTweetSave, onUserRead, showAllTweets = false }) => {
  if (!showAllTweets) {
    tweets = tweets.filter((tweet) => !tweet.isRead);
  }

  let content;
  if (tweets.length === 0) {
    content = (
      <div className='tweet-panel-tweet tweet-panel-tweet-content'>
        <span>No tweetz</span>
        <ion-icon name="sad"></ion-icon>
      </div>
    )
  } else {
    content = tweets
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((tweet) => {
        const tweetLink = `https://twitter.com/${friend.screenName}/status/${tweet.id}`;
        
        // Mark read action icon
        const markReadAction = tweet.isRead ? (
          null
        ) : (
          <span className='tweet-action action-close' onClick={() => onTweetRead(tweet._id)}>
            <ion-icon name="close"></ion-icon>
          </span>
        );

        // Save action icon
        const saveIconStyle = tweet.isSaved ? {color: `yellow`} : {};
        const saveAction = (
          <span className='tweet-action action-save' onClick={() => onTweetSave(tweet._id, !tweet.isSaved)}>
            <ion-icon style={saveIconStyle} name="star"></ion-icon>
          </span>
        );

        // show similarity display if this looks like a duplicate tweet
        let similarityReport = '';
        if (tweet.similarity > 0.5) {
          similarityReport = (
            <div className='tweet-panel-tweet-similarity'>
              ({tweet.similarity}) {tweet.similarityString}
            </div>
          );
        }

        let retweetUser = '';
        if (tweet.retweetUserName) {
          retweetUser = <span className='retweet-user'>@{tweet.retweetUserName}</span>;
        }

        return (
          <div className='tweet-panel-tweet' key={tweet._id}>
            <span className='tweet-action action-open action-left'>
              <a href={tweetLink} target='_blank' rel='noopener noreferrer'>
              <ion-icon name="logo-twitter" />
              </a>
            </span>
            <div className='tweet-panel-tweet-content'>
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
  console.log(friend)
  return (
    <div className='tweet-panel'>
      <header className='tweet-panel-header'>
        <div className='tweet-panel-header-title'>
          <img className='tweet-panel-header-image' src={friend.imgUrl} alt={friend.name}/>
          <span className='tweet-panel-header-name'>{friend.name}</span>
        </div>
        <span className='tweet-panel-header-action' onClick={() => onUserRead(friend.screenName)}>
          Mark<br/>Read
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
  onTweetSave: PropTypes.func.isRequired,
  onUserRead: PropTypes.func.isRequired,
  showAllTweets: PropTypes.bool,
};

export default TweetPanel;
