var trip = {
    name: 'My trip (click to rename)'
  , stops: []
};

/***
 *
 *  addEntry takes loc as a json object representing everything
 *  NOT text
 */

function addEntry(time, loc) {
  trip.stops.push({
      time: parseTime(time)
    , place: {
        name: loc.name
      , coords: loc.geometry && loc.geometry.location
    }
  });
}


function addEntryEl(time, loc_obj, noAnimation) {
  var view = View('entry')
    .time(time)
    .location(loc_obj)
    .remove(function() 
    { 
        this.el.slideUp();
        console.log(unBury(loc_obj));
        for(var i=0;i<trip.stops.length;i++)
        {
            if((trip.stops[i].place.name == unBury(loc_obj).terms[0]) && (time == trips.stops[i].time))
            {
                trips.stops.splice(i,1);
                i--;
            }
        }
   });
  
  if (noAnimation) {
    view.appendTo('.entries')
  }
  else {
    view
      .hide()
      .appendTo('.entries')
      .el.slideDown();
  }
}

function unBury(el)
{
  return $.parseJSON(el.lastChild.innerHTML);
}

function autocomplete() {
  var selected;

  $('.add_entry_submit').click(function() {
    selected = (item.smartAutocompleteData.item)? item.smartAutocompleteData.item : "";
    var time = '8am';
    if (trip.stops.length > 0) {
      var lastTime = trip.stops[trip.stops.length - 1].time;
      time = dateToString(new Date(lastTime.getTime() + 3600000));
    }
    if (selected) addEntryEl(time, selected)
  });

  $('.add_entry_input').smartAutoComplete({
      source: []
    , typeAhead: true
    , filter: function(term, source) {
        var dfd = new $.Deferred()
          , url = '/autocomplete?query=' + term;
        $.getJSON(url, function(data) {
          dfd.resolve($.map(data.predictions, function(item) {
            item.text = item.description;
            return item;
          }));
        });
        return dfd;
      }
    , resultsContainer: '.add_entry_results'
    , resultFormatter: function(res){
        return '<li><div>'+res.text+'</div><div style="display:none;">'+JSON.stringify(res)+'</div></li>';
        }
  }).bind({
      itemFocus: function(item) {
        selected = (item.smartAutocompleteData.item)? item.smartAutocompleteData.item: undefined;
      }
    , itemSelect: function(item) {
        selected = (item.smartAutocompleteData.item)? item.smartAutocompleteData.item : "";
        var time = '8am';
        if (trip.stops.length > 0) {
          var lastTime = trip.stops[trip.stops.length - 1].time;
          time = dateToString(new Date(lastTime.getTime() + 3600000));
        }
        if (selected) addEntryEl(time, selected);
        displaySidebar(unBury(selected));
      }
    , showResults: function() { $('.add_entry_results').show(); }
    , hideResults: function() { $('.add_entry_results').hide(); }
  });
}

function displaySidebar(data) {
  if ((data == undefined) || (data.reference == undefined)) return;

  var ref = data.reference
    , url = '/details?query=' + ref
    , $loading = $('#sidebar_loading')
    , $results = $('#sidebar_results');

  $results.hide();
  $loading.show();

  $.getJSON(url, function(dt) {
    var result = (dt.result === undefined) ? {name: ''} : dt.result;
    var coords = (result.name == '') ? {lng: 0, lat: 0} : result.geometry.location
      , req = new FlickrRequest(coords.lng, coords.lat, result.name)

    var time = '8am';
    if (trip.stops.length > 0) {
      var lastTime = trip.stops[trip.stops.length - 1].time;
      time = dateToString(new Date(lastTime.getTime() + 3600000));
    }
    addEntry(time, result);
    
    req.doQuery(function(images) {
      $loading.hide();
      $results.show();

      var view = View('sidebar')
        .name(result.name)
        .replace('#sidebar_results')
        , $images = $('.images');


      if (images[0]) $('<img>').attr('src', images[0].medium).appendTo($images);
      for (var i = 1, len = images.length; i < len && i < 4; i++) {
        var image = images[i];
        $('<img>').attr('src', image.square).addClass('square').appendTo($images);
      }

    var nearbyurl = '/nearby?nearto=' + coords.lat + "," + coords.lng;

    $.getJSON(nearbyurl, function(nbd) {
      var results = nbd.results;
      if (results == undefined) return;

      for (var i = 0; i < Math.min(results.length, 5); i++) {
        (function () {
          var result = results[i]
            , view = View('nearby')
                .name(result.name)
                .appendTo('.nearby')
                .add(function() {
                  var time = '8am';
                  if (trip.stops.length > 0) {
                    var lastTime = trip.stops[trip.stops.length - 1].time;
                    time = dateToString(new Date(lastTime.getTime() + 3600000));
                  }
                  addEntry(time, result);
                  addEntryEl(time, '<li><div>'+result.name+'</div><div style="display:none;">'+JSON.stringify(result)+'</div></li>');
                });
        })();
      }
     });

    });
  });
}

function updateTripName() {
  var before;
  $('h1.name').live('focus', function() {
    before = $(this).html();
  }).live('blur keyup paste', function() {
    var val = $(this).html();
    if (val != before) trip.name = val;
  });
}

function parseTime(str) {
  var date = new Date();
  var time = str.match(/(\d+)(?::(\d\d))?\s*(p?)/);
  date.setHours(parseInt(time[1]) + (time[3] ? 12 : 0) );
  date.setMinutes( parseInt(time[2]) || 0 );
  return date;
}

function dateToString(date) {
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

function renderMap(mapID, trip) {
  var avgLat = 0
    , avgLng = 0
    , points = [];

  for (var i = 0, len = trip.stops.length; i < len; i++) {
    var stop = trip.stops[i];
    avgLat += stop.place.coords.lat;
    avgLng += stop.place.coords.lng;
  }
  avgLat = avgLat/trip.stops.length;
  avgLng = avgLng/trip.stops.length;

  var map = new google.maps.Map(document.getElementById(mapID), {
      center: new google.maps.LatLng(avgLat, avgLng)
    , zoom: 3
    , disableDefaultUI: true
    , mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  for (var i = 0, len = trip.stops.length; i < len; i++) {
    var stop = trip.stops[i]
      , point = new google.maps.LatLng(stop.place.coords.lat, stop.place.coords.lng)
      , marker = new google.maps.Marker({
          position: point
        , map: map
    })
    points.push(point);
  };

  var path = new google.maps.Polyline({
        path: points
      , strokeColor: '#ffba15'
      });
  path.setMap(map);
}

$(function() {
  autocomplete();
  updateTripName();

  $('ul.entries').delegate('li', 'click', function() {
    var loc = $(this).find('.location');
    if (loc[0])
      var data = unBury(loc[0].firstChild);
    displaySidebar(data);
  });

  $('.save_button').click(function(e) {
    e.preventDefault();
    $('.save_form #trip').remove();
    $('<input type="hidden" name="trip" id="trip" value=\'' + JSON.stringify(trip) + '\'>').appendTo('.save_form');
    $('.save_form').submit();
  });
});
