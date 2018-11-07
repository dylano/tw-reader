const express = require('express');
const apiHelper = require('../helpers/apiHelper');

const router = express.Router();

router
  .route('/tweets')
  .get(apiHelper.getAllTweets)
  .post(apiHelper.refreshTweets);

router.get('/user', apiHelper.getUserTweets);
router.get('/friends/:id', apiHelper.getFriend);

router.route('/timeline').get(apiHelper.getTimeline);
//   .post(apiHelper.refreshTimeline);

router.route('/friends').get(apiHelper.getFriends);
//   .post(apiHelper.refreshFriends);

router.put('/tweets/:id', apiHelper.updateTweet);
router.put('/friends/:screenName', apiHelper.updateFriend);

router.post('/tweets/testsim', apiHelper.testSimilarity);

module.exports = router;
