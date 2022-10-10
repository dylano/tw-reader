import React from 'react';
import { Button, Switch, Alignment } from '@blueprintjs/core';
import './Header.css';

const version = process.env.REACT_APP_VERSION || '';

function Header({
  showAllTweets,
  onChangeShowAllTweets,
  onRefreshTweets,
  isFetchingData,
}) {
  return (
    <header className="app-header">
      <Switch
        className="new-tweet-toggle"
        checked={showAllTweets}
        alignIndicator={Alignment.RIGHT}
        onChange={(value) => onChangeShowAllTweets(value)}
      >
        Show Read?
      </Switch>
      <span className="disclaimer">{version}</span>
      <Button
        className="btn-new-tweets"
        icon="refresh"
        small
        loading={isFetchingData}
        onClick={onRefreshTweets}
      >
        Update
      </Button>
    </header>
  );
}

export default Header;
