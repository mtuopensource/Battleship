// Test
module.exports = {
  FILE_PREFS: '/secrets.env',
  FILE_DB:    'games.sqlite',
  GAME_BOARD_SIZE: 10,
  SHIPS: {
    "Carrier": 5,
    "Battleship": 4,
    "Cruiser": 3,
    "Submarine": 3,
    "Destroyer": 2
  },
  COMMAND_BEGIN: '/begingame',
  COMMAND_HELP: '/help',
  MESSAGE_HELP: 'The command "/begingame" will start your battleship game'
};
