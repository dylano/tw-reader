import React from 'react';
import { Button, Switch, Alignment } from '@blueprintjs/core';
import './Header.css';

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
