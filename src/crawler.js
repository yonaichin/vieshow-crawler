var Crawler = require("js-crawler");
var Cheerio = require("cheerio");

var crawler = new Crawler();

crawler.crawl({
  url: "http://www.vscinemas.com.tw/visPrintShowTimes.aspx?cid=TP&visLang=2",
  success: function(page) {
    var html = page.content.toString();
    var $ = Cheerio.load(html);
    console.log('success', $('.PrintShowTimesFilm').text());
  },
  failure: function(page) {
    console.log(page.status);
  },
  finished: function(crawledUrls) {
    console.log('finished', crawledUrls);
  }
});
