var sqlite3     = require('sqlite3').verbose();
var db          = new sqlite3.Database('./db/vieshow.db');
var Theater     = require('../src/theater.js');
var TheaterMap  = require('../src/data/theater_map.js');
var _           = require('lodash');

var DB = {
  init: function() {
    console.log('[DB] Initialized.', db);
    db.serialize(function() {
      DB.createTable();
      DB.prepareData();

    });
    return db
  },
  createTable: function () {
    console.log('[DB] Creating tables');
    _.map(TheaterMap, function(theater, key) {
      db.run("CREATE TABLE IF NOT EXISTS " + key + " (info TEXT)");
    });
  },
  prepareData: function () {
    console.log('[DB] Preparing datas');
    Theater.getPosters().then(function(posters) {
      _.map(TheaterMap, function(theater, key) {
        var stmt = db.prepare("INSERT INTO " + key + " VALUES (?)");
        Theater.getShowtimes(key, posters).then(function (showtimes) {
          stmt.run(JSON.stringify(showtimes));
          stmt.finalize();
        })
      });

    })
  },
  getShowtimes: function (_theaterId) {
    return new Promise(function (resolve, reject) {
      db.get("SELECT rowid AS id, info FROM " + _theaterId + " ORDER BY rowid DESC LIMIT 1", function(err, row) {
        if (row === undefined) {
          console.log('undefined', _theaterId)
          resolve({});
        } else {
          resolve(JSON.parse(row.info));
        }
      });
    })
  },
  truncateAll: function () {
    _.map(TheaterMap, function(theater, key) {
      console.log('delete table', key);
      db.run("DROP TABLE IF EXISTS " + key);
    })
    setTimeout(function(){
      console.log('[DB] Reinitializing...')
      DB.init();
    }, 5000)
  }
}
module.exports = DB


