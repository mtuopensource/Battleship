var Constants = require('./constants.js');
var env     = require('node-env-file');
var login   = require("facebook-chat-api");
var sqlite3 = require('sqlite3').verbose();

env(__dirname + Constants.FILE_PREFS); // Load user preferences from a file.

var db = new sqlite3.Database(Constants.FILE_DB); // Initialize the games database.
var loginToken = { email: process.env.fbUser, password: process.env.fbPass }; // Holds Facebook login information.
var loginPrefs = { listenEvents: true, selfListen: false }; // Holds Facebook chat options.

console.log('Game Board Size: ' + Constants.GAME_BOARD_SIZE);
console.log('Preferences File: ' + Constants.FILE_PREFS);
console.log('Database: ' + Constants.FILE_DB);

login(loginToken, onLogin);

function Game() {
  this.isStarted = false;
  this.opponentID = -1;
  this.gameID = -1;
  this.threadID = -1;
  this.playerGameBoard = createGameBoard();
  this.computerGameBoard = createGameBoard();
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
    var x = getRandomInt(0, Constants.GAME_BOARD_SIZE - 1);
    var y = getRandomInt(0, Constants.GAME_BOARD_SIZE - 1);
    var vertical = getRandomInt(0, 1) == 1;
    added = addShip(gameBoard, shipLength, x, y, vertical);
  }
}

/**
 * Checks if  (x, y) is valid for a ship of length shipLength.
 * @param  Number gameBoard  The board which will be checked.
 * @param  Number shipLength The length of the ship to be added.
 * @param  Number x          X coordinate of the ship.
 * @param  Number y          Y coordinate of the ship.
 * @return Boolean           True if the position is valid.
 */
function checkShipX(gameBoard, shipLength, x, y) {
  var valid = true;
  var max = Constants.GAME_BOARD_SIZE - 1;
  for(var i = 0; i < shipLength; i++) {
    if(x + i > max || gameBoard[x + i][y] > 0) {
      valid = false; // Position out of bounds or intersects another ship.
    }
  }
  return valid;
}

/**
 * Adds a ship to the gameBoard at (x, y) in a horizontal orientation.
 * @param Number gameBoard  The board to add the ship to.
 * @param Number shipLength The length of the ship.
 * @param Number x          X coordinate of the ship.
 * @param Number y          Y coordinate of the ship.
 */
function addShipX(gameBoard, shipLength, x, y) {
  for(var i = 0; i < shipLength; i++) {
    gameBoard[x + i][y] = shipLength;
  }
}

/**
 * Checks if  (x, y) is valid for a ship of length shipLength.
 * @param  Number gameBoard  The board which will be checked.
 * @param  Number shipLength The length of the ship to be added.
 * @param  Number x          X coordinate of the ship.
 * @param  Number y          Y coordinate of the ship.
 * @return Boolean           True if the position is valid.
 */
function checkShipY(gameBoard, shipLength, x, y) {
  var valid = true;
  var max = Constants.GAME_BOARD_SIZE - 1;
  for(var i = 0; i < shipLength; i++) {
    if(y + i > max || gameBoard[x][y + i] > 0) {
      valid = false; // Position out of bounds or intersects another ship.
    }
  }
  return valid;
}

/**
 * Adds a ship to the gameBoard at (x, y) in a vertical orientation.
 * @param Number gameBoard  The board to add the ship to.
 * @param Number shipLength The length of the ship.
 * @param Number x          X coordinate of the ship.
 * @param Number y          Y coordinate of the ship.
 */
function addShipY(gameBoard, shipLength, x, y) {
  for(var i = 0; i < shipLength; i++) {
    gameBoard[x][y + i] = shipLength;
  }
}

/**
 * Adds a ship to gameBoard at (x, y), if the position is valid.
 * @param  Number gameBoard  The board to add the ship to.
 * @param  Number shipLength The length of the ship.
 * @param  Number x          X coordinate of the ship.
 * @param  Number y          Y coordinate of the ship.
 * @param  Boolean vertical  If true, ship is placed vertically, horizontal otherwise.
 * @return Boolean           True if the ship was placed, false otherwise.
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
 * @param  Number min The lower bound of possible integers.
 * @param  Number max The upper bound of possible integers.
 * @return Number     A random integer between min and max.
 */
function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

/**
 * Creates a new game board, and initializes all elements to zero.
 * @return Integer array representing a game board.
 */
function createGameBoard() {
  var x = new Array(Constants.GAME_BOARD_SIZE);
  for (var i = 0; i < x.length; i++) {
    x[i] = new Array(Constants.GAME_BOARD_SIZE);
    x[i].fill(0); // Fill the empty board with zeroes.
  }
  return x;
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
        api.sendMessage("Your game ID is " + g.gameID + " and your board looks like " + g.playerGameBoard, message.threadID);
        console.log(g);
      } else if(body.startsWith("/help")) {
        api.sendMessage('The command "/begingame" will start your battleship game!', message.threadID);
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
