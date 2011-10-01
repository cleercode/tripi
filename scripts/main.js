function addEntry() {
  var location = $('.add_entry_input').val()
    , gowalla = 'http://www.tripvvv.com/hacku/jsonparser.php?q=Carnegie+Mellon';

  $.getJSON(location, function(data) {
    console.log(data);
  });

  addEntryEl('1pm', location);
}

function addEntryEl(time, location, noAnimation) {
  var view = View('entry')
    .time(time)
    .location(location)
    .remove(function() { this.el.slideUp(); })
  
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

function autocomplete() {
  var selected;

  $('.add_entry_submit').click(function() {
    if (selected) addEntryEl('1pm', selected)
  });

  $('.add_entry_input').smartAutoComplete({
      source: ['Taj Mahal', 'Great Wall of China', 'Pyramid of Giza', 'Carnegie Mellon University']
    , resultsContainer: '.add_entry_results'
  }).bind({
      itemFocus: function(item) {
        selected = item.smartAutocompleteData.item && item.smartAutocompleteData.item.innerText;
      }
    , itemSelect: function(item) {
        selected = item.smartAutocompleteData.item && item.smartAutocompleteData.item.innerText;
        if (selected) addEntryEl('1pm', selected);
        displaySidebar();
      }
    , showResults: function() { $('.add_entry_results').show(); }
    , hideResults: function() { $('.add_entry_results').hide(); }
  });
}

function displaySidebar(location) {
  var gowalla = 'http://www.tripvvv.com/hacku/jsonparser.php?q=' + location.split(' ').join('+');

  console.log(gowalla);

  $.getJSON(gowalla, function(data) {
    var result = data.spots[0];
    $('#sidebar h1').text(location);
    $('#sidebar p.description').text(result.description);

    $('#sidebar .images').empty();

    var req = new FlickrRequest(result.lng, result.lat, location);
    req.doQuery(function(images) {
      if (images[0]) $('<img>').attr('src', images[0].medium).appendTo('.images');
      for (var i = 1, len = images.length; i < len && i < 4; i++) {
        var image = images[i];
        $('<img>').attr('src', image.square).addClass('square').appendTo('.images');
      }
    });
  });
}

$(function() {
  // dummy data
  addEntryEl('12:30pm', 'Taj Mahal', true);
  addEntryEl('2pm', 'Great Wall of China', true);
  addEntryEl('3pm', 'Pyramid of Giza', true);

  autocomplete();

  $('li.entry').click(function() {
    var location = $(this).find('.location').text();
    displaySidebar(location);
  });

  /*
  var req = new FlickrRequest(-79.943047,40.443028,'carnegie');
  req.doQuery(function(images) {
    for (var i = 0, len = images.length; i < len; i++) {
      var image = images[i];
      $('<img>').attr('src', image).appendTo('.images');
    }
  });
  */
});