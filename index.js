var env     = require('node-env-file');
var login   = require("facebook-chat-api");
var sqlite3 = require('sqlite3').verbose();

env(__dirname + '/secrets.env'); // Load secret variables from a file.

var db = new sqlite3.Database('games.sqlite'); // Initialize the games database.
var loginToken = { email: process.env.fbUser,
  password: process.env.fbPass }; // Holds Facebook login information.
var loginPrefs = { listenEvents: true,
    selfListen: false }; // Holds Facebook chat options.

login(loginToken, onLogin);

function Game() {
  this.isStarted = false;
  this.opponentID = -1;
  this.gameID = -1;
  this.threadID = -1;
  this.playerGameBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
  this.computerGameBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
}

/**
 * [onLogin description]
 * @param  {[type]} err [description]
 * @param  {[type]} api [description]
 * @return {[type]}     [description]
 */
function onLogin(err, api) {
  if(err) {
    return console.error(err);
  }
  api.setOptions(loginPrefs);
  api.listen(function callback(err, message) {
    onEventReceived(api, err, message);
  });
}

/**
 * [onEventReceived description]
 * @param  {[type]} api     [description]
 * @param  {[type]} err     [description]
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function onEventReceived(api, err, message) {
  if(err) {
    return console.log(err);
  }
  switch(message.type) {
    case 'message':

      var body = message.body.toLowerCase(); //Sanitize input

      if(body.startsWith("/begingame")){
        var g = new Game();
        g.isStarted = true;
        g.opponentID = message.senderID;
        g.gameID = 17;
        g.threadID = message.threadID;

        api.sendMessage("Your game ID is " + g.gameID + " and your bored looks like " + g.playerGameBoard, message.threadID);
        console.log(g);
      }

      insertMessage(message);
      api.markAsRead(message.threadID, function(err) {
        if(err) {
          console.error(err);
        }
      });
      break;
    case 'event':
      console.log(message);
      break;
  }
}

/**
 * [insertMessage description]
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function insertMessage(message) {
  db.serialize(function() {
    var stmt = db.prepare("INSERT INTO messages (threadID, messageID, body) VALUES (?, ?, ?)");
    stmt.run(message.threadID, message.messageID, message.body);
    stmt.finalize();
  });
}

process.on('exit', function() {
  console.log('Goodbye!');
  db.close(); // Cleanup resources we're using and close connections.
});
