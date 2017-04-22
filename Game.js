var Constants = require('./Constants.js');
var Random    = require('./Random.js');
var method    = Game.prototype;

function Game(fbUserID, fbThreadID, fbAPI, id) {
  this.started = false;
  this.fbUserID = fbUserID;
  this.fbThreadID = fbThreadID;
  this.fbAPI = fbAPI;
  this.id = id;
  this.gameBoard = this.createGameBoard();
  this.gameBoardCPU = this.createGameBoard();
}

/**
 * Checks if  (x, y) is valid for a ship of length length.
 * @param  Number gameBoard  The board which will be checked.
 * @param  Number length     The length of the ship to be added.
 * @param  Number x          X coordinate of the ship.
 * @param  Number y          Y coordinate of the ship.
 * @return Boolean           True if the position is valid.
 */
method.checkShipX = function(gameBoard, length, x, y) {
  var max = Constants.GAME_BOARD_SIZE - 1;
  for(var i = 0; i < length; i++) {
    if(y + i > max || gameBoard[x][y + i] > 0) {
      return false; // Position out of bounds or intersects another ship.
    }
  }
  return true;
};

/**
 * Checks if  (x, y) is valid for a ship of length length.
 * @param  Number gameBoard  The board which will be checked.
 * @param  Number length     The length of the ship to be added.
 * @param  Number x          X coordinate of the ship.
 * @param  Number y          Y coordinate of the ship.
 * @return Boolean           True if the position is valid.
 */
method.checkShipY = function(gameBoard, length, x, y) {
  var max = Constants.GAME_BOARD_SIZE - 1;
  for(var i = 0; i < length; i++) {
    if(x + i > max || gameBoard[x + i][y] > 0) {
      return false; // Position out of bounds or intersects another ship.
    }
  }
  return true;
};

/**
 * Adds a ship to the gameBoard at (x, y) in a horizontal orientation.
 * @param Number gameBoard  The board to add the ship to.
 * @param Number length     The length of the ship.
 * @param Number x          X coordinate of the ship.
 * @param Number y          Y coordinate of the ship.
 */
method.addShipX = function(gameBoard, length, x, y) {
  for(var i = 0; i < length; i++) {
    gameBoard[x][y + i] = length;
  }
};

/**
 * Adds a ship to the gameBoard at (x, y) in a vertical orientation.
 * @param Number gameBoard  The board to add the ship to.
 * @param Number length     The length of the ship.
 * @param Number x          X coordinate of the ship.
 * @param Number y          Y coordinate of the ship.
 */
method.addShipY = function(gameBoard, length, x, y) {
  for(var i = 0; i < length; i++) {
    gameBoard[x + i][y] = length;
  }
};

/**
 * Adds a ship to gameBoard at (x, y), if the position is valid.
 * @param  Number gameBoard  The board to add the ship to.
 * @param  Number length     The length of the ship.
 * @param  Number x          X coordinate of the ship.
 * @param  Number y          Y coordinate of the ship.
 * @param  Boolean vertical  If true, ship is placed vertically, horizontal otherwise.
 * @return Boolean           True if the ship was placed, false otherwise.
 */
method.addShip = function(gameBoard, length, x, y, vertical) {
  var valid = false;
  if(vertical) {
      valid = this.checkShipY(gameBoard, length, x, y);
      if(valid) this.addShipY(gameBoard, length, x, y); // We have a valid location, add the ship.
  } else {
      valid = this.checkShipX(gameBoard, length, x, y);
      if(valid) this.addShipX(gameBoard, length, x, y); // We have a valid location, add the ship.
  }
  return valid;
};

/**
 * Creates a new game board, and initializes all elements to zero.
 * @return Integer array representing a game board.
 */
method.createGameBoard = function() {
  var x = new Array(Constants.GAME_BOARD_SIZE);
  for (var i = 0; i < x.length; i++) {
    x[i] = new Array(Constants.GAME_BOARD_SIZE);
    x[i].fill(0); // Fill the empty board with zeroes.
  }
  return x;
};

/**
 * Resets the cpu board and prompts the user for input.
 */
method.beginGame = function() {
  this.addComputerShip(5);
  this.addComputerShip(4);
  this.addComputerShip(3);
  this.addComputerShip(3);
  this.addComputerShip(2);
  this.sendBoard(this.gameBoard);
  this.fbAPI.sendMessage('Please place your carrier.', this.fbThreadID);
};

/**
 * Adds a ship of given length to a random (x, y) position, with
 * a random orientation.
 * @param Number length The length of the ship.
 */
method.addComputerShip = function(length) {
  var addedShip = false;
  var gameBoard = this.gameBoardCPU;
  while(addedShip == false) {
    var x = Random.getRandomInt(0, Constants.GAME_BOARD_SIZE - 1);
    var y = Random.getRandomInt(0, Constants.GAME_BOARD_SIZE - 1);
    var v = Random.getRandomInt(0, 1) == 1; // True when ship will be placed vertically.
    addedShip = this.addShip(gameBoard, length, x, y, v); // Attempt to add the ship.
  }
};

/**
 * Attempts to add a ship of given length and orientation at (x, y)
 * @param Number    x           X coordinate of the ship.
 * @param Number    y           Y coordinate of the ship.
 * @param Boolean   orientation If true, ship is placed vertically, horizontal otherwise.
 * @param Number    length      The length of the ship.
 * @param String    name        The name of the ship.
 * @param String    next        The name of the next ship. If undefined, the game begins after successful placement.
 */
Game.prototype.addPlayerShip = function(x, y, orientation, length, name, next) {
  var ship = this.addShip(this.gameBoard, length, x, y, orientation); // See if it works!
  if(ship) {
    if(next) {
      this.sendBoard(this.gameBoard);
      this.fbAPI.sendMessage('Please place your ' + next + '.', this.fbThreadID); // Successful, prompt for next.
    } else {
      this.sendBoard(this.gameBoard);
      this.fbAPI.sendMessage('You go first!', this.fbThreadID); // Successful, game can start now.
      this.isStarted = true;
    }
  } else {
    this.fbAPI.sendMessage('Invalid coordinates, please place your ' + name + '.', this.fbThreadID); // Bad position given.
  }
  return ship;
}

/**
 * Processes the last message received, and updates the game state accordingly.
 * @param  Object message Contains metadata for a message such as date, time, and body.
 */
Game.prototype.messageReceive = function(message) {
  if(this.isStarted) {
    if(message != NaN && !isNaN(message)) {
      var x = parseInt(message.charAt(0));
      var y = parseInt(message.charAt(1));
      if (this.gameBoardCPU[x][y] != 0) { //Piece of ship at (x,y)
        //TODO: make function to recognize whether this is a sinking hit or not
        this.gameBoardCPU[x][y] = 'H'
        this.fbAPI.sendMessage('Hit!', this.fbThreadID);
        this.aiTurn();
      } else {
        this.gameBoardCPU[x][y] = 'M'
        this.fbAPI.sendMessage('Miss!', this.fbThreadID);
        this.aiTurn();
      }
    }
  } else {
    var messageSplit = message.split(' ');
    var x = parseInt(messageSplit[0].charAt(0));
    var y = parseInt(messageSplit[0].charAt(1));
    var o = messageSplit[1] == 'vertical';
    if(!this.carrier) {
      this.carrier = this.addPlayerShip(x, y, o, 5, 'carrier', 'battleship');
    } else if(!this.battleship) {
      this.battleship = this.addPlayerShip(x, y, o, 4, 'battleship', 'cruiser');
    } else if(!this.cruiser) {
      this.cruiser = this.addPlayerShip(x, y, o, 3, 'cruiser', 'submarine');
    } else if(!this.submarine) {
      this.submarine = this.addPlayerShip(x, y, o, 3, 'submarine', 'destroyer');
    } else if(!this.destroyer) {
      this.destroyer = this.addPlayerShip(x, y, o, 2, 'destroyer', '');
    }
  }
};

/**
 * Takes the computer's turn against the human player
 */
Game.prototype.aiTurn = function() {
  //TODO: Make ai's turn
};

/**
 * Sends a copy of the given board to the Facebook thread.
 * @param Object The board to send.
 */
Game.prototype.sendBoard = function(gameBoard) {
  var board = '';
  for(var i = 0; i < Constants.GAME_BOARD_SIZE; i++) {
    board = board.concat(gameBoard[i] + '\r\n'); // Check row by row.
  }
  this.fbAPI.sendMessage(board, this.fbThreadID);
};

module.exports = Game;
