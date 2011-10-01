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
      source: []
    , typeAhead: true
    , filter: function(term, source) {
        var dfd = new $.Deferred()
          , url = '/search?query=' + term;
        $.getJSON(url, function(data) {
          dfd.resolve($.map(data.predictions, function(item) {
            return item.description;
          }));
        });
        return dfd;
      }
    , resultsContainer: '.add_entry_results'
  }).bind({
      itemFocus: function(item) {
        selected = item.smartAutocompleteData.item && item.smartAutocompleteData.item.innerText;
      }
    , itemSelect: function(item) {
        selected = item.smartAutocompleteData.item && item.smartAutocompleteData.item.innerText;
        if (selected) addEntryEl('1pm', selected);
        displaySidebar(selected);
      }
    , showResults: function() { $('.add_entry_results').show(); }
    , hideResults: function() { $('.add_entry_results').hide(); }
  });
}

function displaySidebar(location) {
  var gowalla = 'http://www.tripvvv.com/hacku/jsonparser.php?q=' + location.split(' ').join('+')
    , $loading = $('#sidebar_loading')
    , $results = $('#sidebar_results');

    $results.hide();
    $loading.show();

  $.getJSON(gowalla, function(data) {
    var result = data.spots[0]
      , req = new FlickrRequest(result.lng, result.lat, location)

    req.doQuery(function(images) {
      $loading.hide();
      $results.show();

      var view = View('sidebar')
        .name(location)
        .description(result.description)
        .replace('#sidebar_results')
        , $images = $('.images');


      if (images[0]) $('<img>').attr('src', images[0].medium).appendTo($images);
      for (var i = 1, len = images.length; i < len && i < 4; i++) {
        var image = images[i];
        $('<img>').attr('src', image.square).addClass('square').appendTo($images);
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

  $('ul.entries').delegate('li', 'click', function() {
    var location = $(this).find('.location').text();
    displaySidebar(location);
  });
});