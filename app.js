
/**
 * Module dependencies.
 */

var express = require('express')
  , request = require('request')
  , mongoose = require('mongoose');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.set('Google Places key', 'AIzaSyCJM70pl23Z4AepJ02ni1YGac-by5s5I54');
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('Domain', 'http://localhost:8080');
  mongoose.connect('mongodb://localhost/tripi-dev');
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
  app.set('Domain', 'http://tripi-noqg6ztz.dotcloud.com');
  mongoose.connect('mongodb://root:RCSkLwJMdn46l1lWV87E@tripi-NOQG6ZTZ-db-0.dotcloud.com:15650/tripi-prod')
});

var Schema = mongoose.Schema;

// Models
var TripSchema = new Schema({
    name: String
  , stops: [Stop]
});

var StopSchema = new Schema({
    time: Date
  , place: {
      name: String
    , coords: {
          lat: Number
        , lng: Number
      }
    , photos: [String]
  }
});

var Trip = mongoose.model('Trip', TripSchema);
var Stop = mongoose.model('Stop', StopSchema);

// Routes

app.get('/', function(req, res) {
  res.render('index', {
      title: 'Tripi'
  });
});

app.get('/autocomplete', function(req, res) {
  var query = req.param('query')
    , types = escape('amusement_park|aquarium|art_gallery|bar|beauty_salon|bowling_alley|cafe|campground|casino|church|department_store|food|establishment|hindu_temple|jewelry_store|library|liquor_store|local_government_office|meal_takeaway|mosque|movie_theater|museum|night_club|park|restaurant|shopping_mall|spa|stadium|synagogue|university|zoo')
    , url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + encodeURIComponent(query) +
            '&types=' + types + '&location=40,-80&radius=500&sensor=false&key=' + app.set('Google Places key');
  request.get(url, function(error, response, body) {
    res.send(body);
  });
});

app.get('/nearby', function(req, res) {
    var nearto = req.param('nearto') //should be a lat/long, comma-separated
    , types = escape('amusement_park|aquarium|art_gallery|bar|beauty_salon|bowling_alley|cafe|campground|casino|church|department_store|food|hindu_temple|jewelry_store|library|liquor_store|local_government_office|meal_takeaway|mosque|movie_theater|museum|night_club|park|restaurant|shopping_mall|spa|stadium|synagogue|university|zoo')
    , url = 'https://maps.googleapis.com/maps/api/place/search/json?' + 
            '&types=' + types + '&location='+nearto+'&radius=5000&sensor=false&key=' + app.set('Google Places key');
  request.get(url, function(error, response, body) {
    res.send(body);
  });
});

app.get('/details', function(req, res) {
  var query = req.param('query')
    , url = 'https://maps.googleapis.com/maps/api/place/details/json?reference=' + encodeURIComponent(query) + 
            '&sensor=true&key=' + app.set('Google Places key');
  request.get(url, function(error, response, body) {
    res.send(body);
  });
});

app.post('/save', function(req, res) {
  var data = JSON.parse(req.param('trip'));
  
  // dates get transformed to UTC strings by JSON.stringify
  for (var i = 0, len = data.stops.length; i < len; i++) {
    var stop = data.stops[i];
    stop.time = new Date(stop.time);
  }

  var trip = new Trip(data);

  trip.save(function(err) {
    res.render('success', {
        title: 'Tripi'
      , url: app.set('Domain') + '/' + trip.id
    })
  });
});

app.get('/:id', function(req,res) {
  Trip.findById(req.params.id, function(err, trip) {
    if (err) return res.send(404);
    res.render('trip', {
        title: 'Tripi | ' + trip.name
      , trip: trip
      , dateToString: function(date) {
         var hour = date.getHours()
           , minute = date.getMinutes()
           , ap = hour < 12 ? 'am' : 'pm';

        if (hour > 12) hour = hour - 12;
        if (hour == 0) hour = 12;
        if (minute < 10) minute = '0' + minute;
        if (minute == '00') minute = '';
        else minute = ':' + minute;
        return hour + minute + ap;
      }
    })
  });
});

app.listen(8080);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
