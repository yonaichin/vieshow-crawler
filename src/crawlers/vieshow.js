var Crawler = require("js-crawler");
var Cheerio = require("cheerio");
var _       = require('lodash');
var Promise = require('promise');

var VieshowCrawler = {
  getShowtimes: function (_theaterId) {
    console.log("[VieshowCrawler] getShowtimes() from theaterId: %s", _theaterId);
    var crawler = new Crawler();
    var promise = new Promise(function (resolve, reject) {
      crawler.crawl({
        url: "http://www.vscinemas.com.tw/visPrintShowTimes.aspx?cid=" + _theaterId + "&visLang=2",
        success: function(page) {
          var html = page.content.toString();
          var $ = Cheerio.load(html);
          var tables = $('.PrintShowTimesFilm').parent().parent().parent().find('table');
          var showtimes = [];
          _.map(tables, function(table, idx) {
            var title = $(table).find('.PrintShowTimesFilm').text()
            var showtimesDay = _getShowtimesDay($(table));
            var rating = '';
            if (title.indexOf('普遍級') > 0) {
              rating = 'G';
            } else if (title.indexOf('保護級') > 0) {
              rating = 'PG';
            } else if (title.indexOf('輔12級') > 0) {
              rating = 'PG 12';
            } else if (title.indexOf('輔15級') > 0) {
              rating = 'PG 15';
            } else if (title.indexOf('限制級') > 0) {
              rating = 'R';
            }
            title = title.replace(/\(普遍級\)|\(保護級\)|\(輔12級\)|\(輔15級\)|\(限制級\)|/g, '');
            console.log("title %s \n", title);
            showtimes.push({
              'title': title,
              'rating': rating,
              'showtimesDay': showtimesDay
            });
          });
          console.log("[VieshowCrawler] Theater: %s, Success!", _theaterId);
          resolve(showtimes);
        },
        failure: function(page) {
          console.log("[VieshowCrawler] page status: ", page.status);
          reject([])
        }
      });
    })
    return promise
  },
  getListDicArea: function () {
    var crawler = new Crawler();
    var promise = new Promise(function (resolve, reject) {
      crawler.crawl({
        url: "https://www.vscinemas.com.tw/api/GetLstDicArea/",
        success: function(page) {
          console.log('success');
          var json = page.content.toString();
          try {
            json = JSON.parse(json)
            resolve(json);
          } catch (err) {
            console.log('error: ', err);
            reject([]);
          }
        },
        failure: function(page) {
          console.log("[VieshowCrawler] page status: ", page.status);
          reject([]);
        }
      });
    })
    return promise
  }
};

function _getShowtimesDay (table) {
  var showtimesDay = []
  t = table.find('.PrintShowTimesDay');
  s = table.find('.PrintShowTimesSession');
  _.map(t, function(tmp, idx) {
    var day = tmp.children[0].data
    day = (new Date()).getFullYear() + '/' + day.split(' ')[0].replace(/月/g,'/').replace(/日/g,'')
    var timestamp = (new Date(day)).getTime()
    showtimesDay[idx] = {
      'day': day,
      'timestamp': timestamp
    }
  })
  _.map(s, function(tmp, idx) {
    showtimesDay[idx].sessions =  tmp.children[0].data.replace(/ /g, '').split(',')
  })
  return showtimesDay
}

module.exports = VieshowCrawler
