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


  $('.add_entry').click(function() {
    View('entry')
      .time('1pm')
      .location('Carnegie Mellon University')
      .appendTo('.entries');
  });
});