var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('games.sqlite');

db.serialize(function() {
  db.run("CREATE TABLE messages (info TEXT)");
});

db.close();
