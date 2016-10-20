var express = require('express');
var app = express();
var TheaterList = require('../src/data/theater_list.js');

app.set('port', (process.env.PORT || 3000));

app.get('/', function (req, res) {
  res.send('VIESHOW Cinemas Showtimes!');
});
app.get('/theater', function (req, res) {
  res.json(TheaterList);
});

app.listen(app.get('port'), function() {
  console.log('VIESHOW crawler now running on http://localhost:' + app.get('port'));
});


