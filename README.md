# tw-reader

Provide environment vars to satisfy:

var client = new Twitter({
 consumer_key: process.env.TW_CONSUMER_KEY,
 consumer_secret: process.env.TW_CONSUMER_SECRET,
 access_token_key: process.env.TW_TOKEN_KEY,
 access_token_secret: process.env.TW_TOKEN_SECRET,
});
