var express = require('express');
var _ = require('lodash');
var app = express();
var TheaterList = require('../src/data/theater_list.js');
var Theater = require('../src/theater.js');

app.set('port', (process.env.PORT || 3000));

app.get('/', function (req, res) {
  res.send('VIESHOW Cinemas Showtimes!');
});
app.get('/theater', function (req, res) {
  res.json(Theater.getTheaters());
});
app.get('/theater/:theaterId', function (req, res) {
  var _theaterId = req.params.theaterId;
  var theaters = Theater.getTheaters();
  var matchTheaters = false;
  _.map(theaters, function(theater) {
    if (theater.value == _theaterId) {
      matchTheaters = true;
    }
  });

  if (matchTheaters) {
    Theater.getShowtimes(_theaterId).then(function (showtimes, err) {
      if (err) {
        res.json([])
      } else {
        res.json(showtimes);
      }
    });
  } else {
    res.status(400).json({'error': "Theater id doesn't match the list."});
  }

});
app.get('/*', function (req, res) {
  res.redirect('/');
});

app.listen(app.get('port'), function() {
  console.log('VIESHOW crawler now running on http://localhost:' + app.get('port'));
});


