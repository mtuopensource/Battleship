var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('games.sqlite');

db.serialize(function() {
  db.run("CREATE TABLE messages (info TEXT)");
  db.run("ALTER TABLE messages ADD threadID char(20)");
  db.run("ALTER TABLE messages ADD messageID char(50)");
  db.run("ALTER TABLE messages ADD body text(5000)");
});



db.close();
