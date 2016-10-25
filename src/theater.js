var theaterMap     = require('./data/theater_map.js');
var VieshowCrawler = require('./crawlers/vieshow.js');
var Promise        = require('promise');

var Theater = {
  init: function () {
    console.log('Theater init');
  },
  getTheaters: function () {
    return theaterMap;
  },
  getShowtimes: function (theater_id) {
    return new Promise (function (resolve, reject) {
      VieshowCrawler.getShowtimes(theater_id).then(function(res, err) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    })
  },
  getListDicArea: function () {
    return new Promise (function (resolve, reject) {
      VieshowCrawler.getListDicArea().then(function(res, err) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    })
  }
}

module.exports = Theater
