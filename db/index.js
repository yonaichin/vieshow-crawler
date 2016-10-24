var sqlite3     = require('sqlite3').verbose();
var db          = new sqlite3.Database('./db/vieshow.db');
var Theater     = require('../src/theater.js');
var TheaterList = require('../src/data/theater_list.js');
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
    _.map(TheaterList, function(theater) {
      db.run("CREATE TABLE IF NOT EXISTS " + theater.value + " (info TEXT)");
    });
  },
  prepareData: function () {
    console.log('[DB] Preparing datas');
    _.map(TheaterList, function(theater) {
      var stmt = db.prepare("INSERT INTO " + theater.value + " VALUES (?)");
      Theater.getShowtimes(theater.value).then(function (showtimes) {
        stmt.run(JSON.stringify(showtimes));
        stmt.finalize();
      })
    });
  },
  getShowtimes: function (_theaterId) {
    return new Promise(function (resolve, reject) {
      db.get("SELECT rowid AS id, info FROM " + _theaterId + " ORDER BY rowid DESC LIMIT 1", function(err, row) {
        resolve(JSON.parse(row.info));
      });
    })
  },
  truncateAll: function () {
    _.map(TheaterList, function(theater) {
      console.log('delete table', theater.value);
      db.run("DROP TABLE " + theater.value);
    })
    setTimeout(function(){
      console.log('[DB] Reinitializing...')
      DB.init();
    }, 5000)
  }
}
module.exports = DB


