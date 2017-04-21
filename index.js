var Constants = require('./Constants.js');
var Game      = require('./Game.js');
var Sqlite3   = require('sqlite3').verbose();
var env       = require('node-env-file');
var login     = require("facebook-chat-api");

console.log('Game Board Size: ' + Constants.GAME_BOARD_SIZE);
console.log('Preferences File: ' + Constants.FILE_PREFS);
console.log('Database: ' + Constants.FILE_DB);
console.log("Ships: " + JSON.stringify(Constants.SHIPS));

env(__dirname + Constants.FILE_PREFS); // Load user preferences from a file.

var db    = new Sqlite3.Database(Constants.FILE_DB); // Load the games database from a file.
var token = { email: process.env.fbUser, password: process.env.fbPass }; // Facebook login information.
var prefs = { listenEvents: true, selfListen: false }; // Chat preferences
var games = { }; // A dictionary relating user id to game.

login(token, onLogin); // Create a connection to Facebook.

/**
 * Fired after a successful login. Registers event handler for events.
 * @param  Object err Contains the stack and trace associated with any errors.
 * @param  Object api A reference to the Facebook api.
 * @return Object     Returns after an error has occured.
 */
function onLogin(err, api) {
  if(err) return console.error(err);
  api.setOptions(prefs);
  api.listen(function callback(err, message) {
    onEventReceived(api, err, message); // Handle event.
  });
}

/**
 * Fired after an event is received. Fires other appropriate events.
 * @param  Object api     A reference to the Facebook api.
 * @param  Object err     Contains the stack and trace associated with any errors.
 * @param  Object event   Contains metadata for an event such as date, time, and body.
 * @return Object         Returns after an error has occured.
 */
function onEventReceived(api, err, event) {
  if(err) return console.error(err);
  if(event.type == 'message') {
    onMessageReceived(api, event);
  } else if(event.type == 'event') {
    console.log(event);
  }
}

/**
 * Fired after a message is received. Passes relevant information to games.
 * @param  Object api     A reference to the Facebook api
 * @param  Object message Contains metadata for a message such as date, time, and body.
 * @return Object         Returns after an error has occured.
 */
function onMessageReceived(api, message) {
  var body = message.body.toLowerCase(); //Sanitize input.
  insertMessage(body);
  markMessageAsRead(api, message);
  if(body.startsWith(Constants.COMMAND_BEGIN)) {
    var game = new Game(message.senderID, message.threadID, api, 17);
    games[message.senderID] = game; // Store this in the dictionary.
    game.beginGame(); // Start the game!
  } else if(body.startsWith(Constants.COMMAND_HELP)) {
    api.sendMessage(Constants.MESSAGE_HELP, message.threadID);
  } else {
    var game = games[message.senderID];
    game.messageReceive(message.body);
  }
}

/**
 * Marks the specified message as read.
 * @param  Object api     A reference to the Facebook api
 * @param  Object message Contains metadata for a message such as date, time, and body.
 * @return Object         Returns after an error has occured.
 */
function markMessageAsRead(api, message) {
  api.markAsRead(message.threadID, function(err) {
    if(err) return console.error(err); // Mark message as read on Facebook chat.
  });
}

/**
 * Records the specified message to the database.
 * @param  Object message Contains metadata for a message such as date, time, and body.
 * @return Object         Returns after an error has occured.
 */
function insertMessage(message) {
  db.serialize(function() {
    var stmt = db.prepare("INSERT INTO messages (threadID, messageID, body) VALUES (?, ?, ?)");
    stmt.run(message.threadID, message.messageID, message.body); // Fill in template values
    stmt.finalize();
  });
}

process.on('exit', function() {
  console.log('Goodbye!');
  db.close(); // Cleanup resources we're using and close connections.
});
