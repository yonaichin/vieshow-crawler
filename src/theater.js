var theaterList = require('./data/theater_list.js');
var VieshowCrawler = require('./crawlers/vieshow.js');
var Promise = require('promise');

var Theater = {
  init: function () {
    console.log('Theater init');
  },
  getTheaters: function () {
    return theaterList;
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
  }
}

module.exports = Theater
