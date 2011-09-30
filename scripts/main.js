function addEntry() {
  var location = $('.add_entry_input').val()
    , gowalla = 'http://api.gowalla.com/spots/18568';

  $.getJSON(gowalla, function(data) {
    console.log(data);
  });

  View('entry')
    .time('1pm')
    .location(location)
    .hide()
    .appendTo('.entries')
    .el.slideDown();
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


  $('.add_entry_submit').click(addEntry);

  $('.add_entry_input').bind('keypress', function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) addEntry();
  });
});