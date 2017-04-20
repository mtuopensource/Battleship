var env   = require('node-env-file');
var login = require("facebook-chat-api");

env(__dirname + '/secrets.env');

// Create simple echo bot
login({email: process.env.fbUser, password: process.env.fbPass}, function callback (err, api) {
  if(err) return console.error(err);
  api.listen(function callback(err, message) {
      api.sendMessage(message.body, message.threadID);
  });
});
