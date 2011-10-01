
/**
 * Module dependencies.
 */

var express = require('express')
  , request = require('request');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Express'
  });
});

app.get('/search', function(req, res) {
  var query = req.param('query')
  , url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + encodeURIComponent(query) +
          '&types=establishment&location=40,-80&radius=500&sensor=true&key=AIzaSyAyhFF7BBmfMhRZElunBN1rsfh-UEfohEM';
  request.get(url, function(error, response, body) {
    res.send(body);
  });
})

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
