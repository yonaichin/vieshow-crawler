var express = require('express');
var app = express();
var TheaterList = require('../src/data/theater_list.js');

app.get('/', function (req, res) {
  res.send('VIESHOW Cinemas Showtimes!');
});
app.get('/theater', function (req, res) {
  res.json(TheaterList);
});

app.listen(3000, function () {
  console.log('VIESHOW crawler now running on http://localhost:3000');
});
