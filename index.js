var login = require("facebook-chat-api");

// Create simple echo bot
login({email: "", password: ""}, function callback (err, api) {
  if(err) return console.error(err);
  api.listen(function callback(err, message) {
      api.sendMessage(message.body, message.threadID);
  });
});
