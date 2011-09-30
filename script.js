$(function() {
  $('.add_entry').click(function() {
    View('entry')
      .time('1pm')
      .location('Carnegie Mellon University')
      .appendTo('.entries');
  });
});