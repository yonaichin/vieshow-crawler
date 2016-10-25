var express     = require('express');
var cors        = require('cors');
var _           = require('lodash');
var Promise     = require('promise');


var Theater     = require('../src/theater.js');
var DB          = require('../db/index.js');

var app         = express();

app.use(cors());

app.set('port', (process.env.PORT || 3000));

// views is directory for all template files
app.set('views', __dirname + '/../src/views');
app.set('view engine', 'ejs');


app.get('/', function (req, res) {
  res.render('index');
});

app.get('/theater', function (req, res) {
  res.json(Theater.getTheaters());
});

app.get('/api/getListDicArea', function (req, res) {
  Theater.getListDicArea().then(function (list, err) {
    if (err) {
      res.json([])
    } else {
      res.json(list);
    }
  });
});

app.get('/theater/:theaterId', function (req, res) {
  var _theaterId = req.params.theaterId;
  var theaters = Theater.getTheaters();
  var matchTheaters = false;
  _.map(theaters, function(theater, key) {
    if (key == _theaterId) {
      matchTheaters = true;
    }
  });

  if (matchTheaters) {
    DB.getShowtimes(req.params.theaterId).then(function(t) {
      res.json(t);
    });
  } else {
    res.status(400).json({'error': "Theater id doesn't match the list."});
  }

});

app.get('/*', function (req, res) {
  res.redirect('/');
});

Promise.resolve()
  .then(function () {
    DB.init();
  })
  .finally(function () {
    app.listen(app.get('port'), function() {
      console.log('VIESHOW crawler now running on http://localhost:' + app.get('port'));
    });
  })


