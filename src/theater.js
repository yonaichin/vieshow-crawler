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
  getPosters: function () {
    return new Promise (function (resolve, reject) {
      VieshowCrawler.getPosters().then(function(res, err) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    })
  },
  getShowtimes: function (theater_id, posters) {
    return new Promise (function (resolve, reject) {
      VieshowCrawler.getShowtimes(theater_id, posters).then(function(res, err) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    })
  },
  getTicketUrl: function (payload) {
    return new Promise (function (resolve, reject) {
      VieshowCrawler.getTicketUrl(payload).then(function(res, err) {
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
