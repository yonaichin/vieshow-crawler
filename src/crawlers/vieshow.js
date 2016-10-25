var Crawler     = require("js-crawler");
var Cheerio     = require("cheerio");
var _           = require('lodash');
var Promise     = require('promise');

var TheaterMap = require('../data/theater_map.js');


var VieshowCrawler = {

  getShowtimes: function (_theaterId) {
    return new Promise.all([VieshowCrawler.getShowtimes_C(_theaterId), VieshowCrawler.getShowtimes_E(_theaterId), VieshowCrawler.getLstDicMovie(_theaterId)]).then(function(res) {
      var showtimes_c = res[0]
      var showtimes_e = res[1]
      var movies = res[2]
      var showtimes = new Promise(function(resolve, reject) {
        _.map(showtimes_c, function(st, idx) {
          var movie = _.find(movies, function(o) {
            return o.text == st.title['original']
          });
          st.title.en = showtimes_e[idx].title.en
          st.movieId = movie['cinemaId']

          if ((idx + 1 ) === showtimes_c.length) {
            resolve(showtimes_c)
          }
        })
      })
      return showtimes
    })
  },
  getShowtimes_C: function (_theaterId) {
    console.log("[VieshowCrawler] getShowtimes() from theaterId: %s", _theaterId);
    var crawler = new Crawler();
    var promise = new Promise(function (resolve, reject) {
      crawler.crawl({
        url: "http://www.vscinemas.com.tw/visPrintShowTimes.aspx?cid=" + _theaterId + "&visLang=2",
        success: function(page) {
          var html = page.content.toString();
          var $ = Cheerio.load(html);
          var tables = $('.PrintShowTimesFilm').parent().parent().parent().find('table');
          var showtimes_c = [];
          _.map(tables, function(table, idx) {
            var title = $(table).find('.PrintShowTimesFilm').text()
            var showtimesDay = _getShowtimesDay($(table));
            var cinemaType = [];
            var rating = '';
            var label = '';
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
            var originalTitle = title.trim().replace(/ /g, '');

            // filter cinemaType
            label = title.split('\)')[0];
            title = title.split('\)')[1].replace(/ /g, '');
            cinemaType = _getCinemaType(label);

            showtimes_c.push({
              'title': {
                'original': originalTitle,
                'zh-tw':title,
                'en': null
              },
              'rating': rating,
              'showtimesDay': showtimesDay,
              'cinemaType': _.uniq(cinemaType),
              'movieId': null
            });
          });
          console.log("[VieshowCrawler] Theater: %s, Success!", _theaterId);
          resolve(showtimes_c);
        },
        failure: function(page) {
          console.log("[VieshowCrawler] page status: ", page.status);
          reject([])
        }
      });
    })
    return promise
  },
  getShowtimes_E: function (_theaterId) {
    console.log("[VieshowCrawler] EN getShowtimes() from theaterId: %s", _theaterId);
    var crawler = new Crawler();
    var promise = new Promise(function (resolve, reject) {
      crawler.crawl({
        url: "http://www.vscinemas.com.tw/visPrintShowTimes.aspx?cid=" + _theaterId + "&visLang=1",
        success: function(page) {
          var html = page.content.toString();
          var $ = Cheerio.load(html);
          var tables = $('.PrintShowTimesFilm').parent().parent().parent().find('table');
          var showtimes = [];
          _.map(tables, function(table, idx) {
            var title = $(table).find('.PrintShowTimesFilm').text()
            title = title.split('\)')[1];
            title = title.split('\(')[0].toLowerCase().trim();

            showtimes.push({
              'title': {
                'en': title
              }
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
  },
  getLstDicMovie: function (_theaterId) {
    var crawler = new Crawler();
    var promise = new Promise(function (resolve, reject) {
      crawler.crawl({
        url: "https://www.vscinemas.com.tw/api/GetLstDicMovie/?cinema=" + TheaterMap[_theaterId]['cinemaId'],
        success: function(page) {
          var json = page.content.toString();
          try {
            json = JSON.parse(json)
            var lstDicMovie = _.map(json, function(j) {
              return {
                'text': j.strText.replace(/ /g,''),
                'cinemaId': j.strValue
              }
            })
            resolve(lstDicMovie);
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

function _getCinemaType (label) {
  var cinemaType = [];
  if (label.indexOf('數位') > 0) {
    cinemaType.push('digital');
  }
  if (label.indexOf('3D') > 0) {
    cinemaType.push('3d');
  }
  if (label.indexOf('未來3D') > 0) {
    cinemaType.push('futuristic 3d');
    cinemaType = _.filter(cinemaType, function(n) {
      return n !== '3d';
    })
  }
  if (label.indexOf('4D') > 0) {
    cinemaType.push('4d');
  }
  if (label.indexOf('4DX') > 0) {
    cinemaType.push('4dx');
    cinemaType = _.filter(cinemaType, function(n) {
      return n !== '4d';
    })
  }
  if (label.indexOf('IMAX') > 0) {
      cinemaType.push('imax');
  }
  if (label.indexOf('GC') > 0) {
    cinemaType.push('gc');
  }
  if (label.indexOf('MAPPA') > 0) {
    cinemaType.push('mappa');
  }
  if (label.indexOf('國') > 0) {
    cinemaType.push('chinese');
  }
  if (label.indexOf('英') > 0) {
    cinemaType.push('english');
  }
  return cinemaType
}

module.exports = VieshowCrawler
