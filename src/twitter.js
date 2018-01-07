var Twitter = require('twitter');

var client = new Twitter({
 consumer_key: process.env.TW_CONSUMER_KEY,
 consumer_secret: process.env.TW_CONSUMER_SECRET,
 access_token_key: process.env.TW_TOKEN_KEY,
 access_token_secret: process.env.TW_TOKEN_SECRET,
});

var params = {screen_name: 'dtoliver', count: 1, trim_user:1, include_entities:0};

function log(msg) {
    console.log(msg);
}

function logError (error) {
    log("**Error: " + error.message);    
}

client.get('statuses/user_timeline', params)
    .then(function(tweets) {
        console.log(tweets);
    })
    .catch(function(error) {
        logError(error);
    });


params = {screen_name: 'dtoliver', since_id: '949401650174840800', count: 5, trim_user:0};

client.get('statuses/home_timeline', params)
    .then(function(tweets) {
        for(tweet of tweets) {
            console.log(formatTweet(tweet))
        }
    })
    .catch(function(error) {
        logError(error);
    });
    
function formatTweet (tweet) {
    var userId = tweet.user.id;

    return tweet.id + ' <' + tweet.user.name + '>  ' + tweet.text;
}

// Retrieve list of friends -- todo: figure out how to use cursor w/ promises
friendCursor = -1;
params = {screen_name: 'dtoliver', count:20, next_cursor_str: -1}
{
    params['next_cursor_str'] = friendCursor;
    getFriends(params);
    // update friendCursor and call for the next batch
}

function getFriends(params) {
    client.get('friends/list', params)
        .then(function(fList) {
            for(user of fList.users) {
                log(user.name);
            }
        })
        .catch(function(error) {
            logError(error);
        });
}
