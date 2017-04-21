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
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
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
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
}

Game.prototype.beginGame = function() {
  this.addComputerShip(5);
  this.addComputerShip(4);
  this.addComputerShip(3);
  this.addComputerShip(3);
  this.addComputerShip(2);
}

Game.prototype.addComputerShip = function(shipLength) {
  var added = false;
  var gameBoard = this.computerGameBoard;
  while(added == false) {
    var x = getRandomInt(0, 9);
    var y = getRandomInt(0, 9);
    var vertical = getRandomInt(0, 1) == 1;
    added = addShip(gameBoard, shipLength, x, y, vertical);
  }
}

/**
 * Checks if  (x, y) is valid for a ship of length shipLength.
 * @param  Integer gameBoard  The board which will be checked.
 * @param  Integer shipLength The length of the ship to be added.
 * @param  Integer x          X coordinate of the ship.
 * @param  Integer y          Y coordinate of the ship.
 * @return Boolean            True if the position is valid.
 */
function checkShipX(gameBoard, shipLength, x, y) {
  var valid = true;
  for(var i = 0; i < shipLength; i++) {
    if(x + i > 9 || gameBoard[x + i][y] > 0) {
      valid = false; // Position out of bounds or intersects another ship.
    }
  }
  return valid;
}

/**
 * Adds a ship to the gameBoard at (x, y) in a horizontal orientation.
 * @param Integer gameBoard  The board to add the ship to.
 * @param Integer shipLength The length of the ship.
 * @param Integer x          X coordinate of the ship.
 * @param Integer y          Y coordinate of the ship.
 */
function addShipX(gameBoard, shipLength, x, y) {
  for(var i = 0; i < shipLength; i++) {
    gameBoard[x + i][y] = shipLength;
  }
}

/**
 * Checks if  (x, y) is valid for a ship of length shipLength.
 * @param  Integer gameBoard  The board which will be checked.
 * @param  Integer shipLength The length of the ship to be added.
 * @param  Integer x          X coordinate of the ship.
 * @param  Integer y          Y coordinate of the ship.
 * @return Boolean            True if the position is valid.
 */
function checkShipY(gameBoard, shipLength, x, y) {
  var valid = true;
  for(var i = 0; i < shipLength; i++) {
    if(y + i > 9 || gameBoard[x][y + i] > 0) {
      valid = false; // Position out of bounds or intersects another ship.
    }
  }
  return valid;
}

/**
 * Adds a ship to the gameBoard at (x, y) in a vertical orientation.
 * @param Integer gameBoard  The board to add the ship to.
 * @param Integer shipLength The length of the ship.
 * @param Integer x          X coordinate of the ship.
 * @param Integer y          Y coordinate of the ship.
 */
function addShipY(gameBoard, shipLength, x, y) {
  for(var i = 0; i < shipLength; i++) {
    gameBoard[x][y + i] = shipLength;
  }
}

/**
 * Adds a ship to gameBoard at (x, y), if the position is valid.
 * @param  Integer gameBoard  The board to add the ship to.
 * @param  Integer shipLength The length of the ship.
 * @param  Integer x          X coordinate of the ship.
 * @param  Integer y          Y coordinate of the ship.
 * @param  Boolean vertical   If true, ship is placed vertically, horizontal otherwise.
 * @return Boolean            True if the ship was placed, false otherwise.
 */
function addShip(gameBoard, shipLength, x, y, vertical) {
  var valid = false;
  if(vertical) {
    valid = checkShipY(gameBoard, shipLength, x, y); // Check if location is valid.
    if(valid) {
      addShipY(gameBoard, shipLength, x, y); // If so, add the ship.
    }
  } else {
    valid = checkShipX(gameBoard, shipLength, x, y); // Check if location is valid.
    if(valid) {
      addShipX(gameBoard, shipLength, x, y); // If so, add the ship.
    }
  }
  return valid;
}

/**
 * Returns a random integer between min and max.
 * @param  Integer min The lower bound of possible integers.
 * @param  Integer max The upper bound of possible integers.
 * @return Integer     A random integer between min and max.
 */
function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min);
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
        g.beginGame();
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
