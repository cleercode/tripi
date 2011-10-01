/***
 *
 *  addEntry takes loc as a json object representing everything
 *  NOT text
 */

function addEntry(time, loc_obj)
{
  var loc = unBury(loc_obj);
  localStorage.clear();
  var s = window.localStorage;

  var it = s.getItem("iter"); //iter for itinerary

  if(!it)
  {
    it = new Object()
    it.days=new Array();

    it.days[0]=new Object();
    it.days[0].stops = new Array();
  }
  it.days[0].stops.push({'time': time, 'loc': loc})
  
  s.setItem("iter",JSON.stringify(it));
}


function addEntryEl(time, loc_obj, noAnimation) {
  var view = View('entry')
    .time(time)
    .location(loc_obj)
    .remove(function() { this.el.slideUp(); })

  if(loc_obj.firstChild)
  {
      addEntry(time, loc_obj);
      //console.log(unBury(loc_obj));
//    view.location(loc_obj.firstChild.innerHTML + "<div style='display:none'>"+loc_obj.lastChild.innerHTML+"</div>");
  }
  
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
    if (selected) addEntryEl('1pm', selected)
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
        if (selected) addEntryEl('1pm', selected);
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


  console.log(ref);
  $results.hide();
  $loading.show();

  $.getJSON(url, function(dt) {
    var result = (dt.result === undefined) ? {name: ''} : dt.result;
    var coords = (result.name == '') ? {lng: 0, lat: 0} : result.geometry.location
      , req = new FlickrRequest(coords.lng, coords.lat, result.name)

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
    var loc = $(this).find('.location');
    if (loc[0])
      var data = unBury(loc[0].firstChild);
    displaySidebar(data);
  });
});
