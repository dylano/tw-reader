import React from "react";
import PropTypes from "prop-types";
import {Button, Switch, Alignment} from "@blueprintjs/core";
import "./Header.css";

const Header = ({showAllTweets, onChangeShowAllTweets, onRefreshTweets, isFetchingData}) => {
  return (
    <header className="app-header">
      <Switch
        className="new-tweet-toggle"
        checked={showAllTweets}
        alignIndicator={Alignment.RIGHT}
        onChange={value => onChangeShowAllTweets(value)}
      >
        Show Read?
      </Switch>
      <Button
        className="btn-new-tweets"
        icon="refresh"
        small={true}
        loading={isFetchingData}
        onClick={onRefreshTweets}
      >
        Update
      </Button>
    </header>
  );
};

Header.propTypes = {
  showAllTweets: PropTypes.bool.isRequired,
  onChangeShowAllTweets: PropTypes.func.isRequired,
  onRefreshTweets: PropTypes.func.isRequired,
  isFetchingData: PropTypes.bool.isRequired
};

export default Header;
