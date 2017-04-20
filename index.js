var env     = require('node-env-file');
var login   = require("facebook-chat-api");
var sqlite3 = require('sqlite3').verbose();

env(__dirname + '/secrets.env'); // Load secret variables from a file.

var db = new sqlite3.Database('games.sqlite'); // Initialize the games database.
var loginToken = { email: process.env.fbUser,
  password: process.env.fbPass }; // Holds Facebook login information.
var options = { listenEvents: true,
  selfListen: false }; // Holds Facebook chat options.

process.on('exit', function() {
  console.log('Goodbye!');
  db.close(); // Cleanup resources we're using and close connections.
});

// Create a bot that logs all messages
login(loginToken, function callback (err, api) {
  if(err) return console.error(err);
  api.setOptions(options);
  api.listen(function callback(err, message) {
      if(err) return console.log(err);

      switch(message.type) {
        case "message": //If a message is sent to the chat do this:
          api.markAsRead(message.threadID, function(err) {
            if (err) console.log(err); //Mark the message as read
          });
          //api.sendMessage(message.body, message.threadID); //TODO: echo if we want it
          db.serialize(function() { //Adds all messages sent to the DB
            var stmt = db.prepare("INSERT INTO messages (threadID, messageID, body) VALUES (?, ?, ?)");
            stmt.run(message.threadID, message.messageID, message.body);
            stmt.finalize();
          });
          console.log(message);
          break;
        case "event": //Console.log all events
          console.log(message);
          break;
      }
  });
});
