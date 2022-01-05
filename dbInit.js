const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('scrims.db')

db.run('CREATE TABLE IF NOT EXISTS slotList(slotNum number primary key, teamName text, userid text unique)')
