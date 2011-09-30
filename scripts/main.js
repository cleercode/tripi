function addEntry() {
  var location = $('.add_entry_input').val()
    , gowalla = 'http://api.gowalla.com/spots/18568';

  $.getJSON(gowalla, function(data) {
    console.log(data);
  });

  addEntryEl('1pm', location);
}

function addEntryEl(time, location) {
  View('entry')
    .time(time)
    .location(location)
    .remove(function() { this.el.slideUp(); })
    .hide()
    .appendTo('.entries')
    .el.slideDown();
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
      }
    , showResults: function() { $('.add_entry_results').show(); }
    , hideResults: function() { $('.add_entry_results').hide(); }
  });
}

$(function() {
  // dummy data
  View('entry')
    .time('12:30pm')
    .location('Taj Mahal')
    .appendTo('.entries');

  View('entry')
    .time('2pm')
    .location('Great Wall of China')
    .appendTo('.entries');

  View('entry')
    .time('3pm')
    .location('Pyramid of Giza')
    .appendTo('.entries');

  autocomplete();

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