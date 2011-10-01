/***************
 *
 * HOW TO USE:
 *
 *  Short version:
 *    (new PlacesRequest(long,lat,searchterm)).doQuery(callbackfunction);
 *
 *  Long version:
 *    var req = new FlickRequest(long,lat,searchterm);
 *    var callback = function(urllist){ do something with a list of image urls };
 *    req.doQuery(callback);
 *
 *  long = longitude
 *  lat = latitude
 *  searchterm = some description
 */
function PlacesRequest(lon, lat)
{
/*
    this.longitude = "-79.943047";
    this.latitude = "40.443028";
*/
    this.longitude = lon;
    this.latitude = lat;

    this.callBack = function(){alert("No Places Callback Implemented! D:");};

    function parsePlaces(data)
    {
        response = data;
        var places = data.results;
        return $(places);
    }
    
    /*
     * Generate an image URL based on an image object
     */

    function callBackArray(data)
    {
        callBack(parsePlaces(data));
    }

    this.doQuery = function(callbackfunc)
    {
        callBack = callbackfunc;

        var url_bas= "https://maps.googleapis.com/maps/api/place/search/json?";
        var url_loc= "location="+this.latitude+","+this.longitude+"&radius=50000";
        var url_sen= "&sensor=false";
        var types = "&types="+escape("amusement_park|aquarium|art_gallery|bar|beauty_salon|bowling_alley|cafe|campground|casino|church|department_store|establishment|food|hindu_temple|jewelry_store|library|liquor_store|local_government_office|meal_takeaway|mosque|movie_theater|museum|night_club|park|restaurant|shopping_mall|spa|stadium|synagogue|university|zoo");
        var url_key= "&key=AIzaSyCqzhXkURBC_OnjacQDGFLaKw3Kc7keTow";

        var query = url_bas + url_loc + types + url_sen + url_key;
 

        $.getJSON('http://jdcooper.dyndns.org/jsonpwrapper.php?URL='+escape(query)+'&callback=?',callBackArray);
    }
}
