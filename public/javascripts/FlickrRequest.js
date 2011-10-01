/***************
 *
 * HOW TO USE:
 *
 *  Short version:
 *    (new FlickrRequest(long,lat,searchterm)).doQuery(callbackfunction);
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
function FlickrRequest(lon, lat, term)
{
/*
    this.longitude = "-79.943047";
    this.latitude = "40.443028";
    this.searchterm = "Carnegie Mellon University";
*/
    this.longitude = lon;
    this.latitude = lat;
    this.searchterm = term;

    this.callBack = function(){alert("No Flickr Callback Implemented! D:");};

    function parseFlickr(data)
    {
        response = data;
        if(!response || !response.query || !response.query.results)
            return Array(); //silent error fail
        var pics = data.query.results.photo;
        var ct = data.query.count;
        
        return $(pics).map(imgurl);
    }
    
    /*
     * Generate an image URL based on an image object
     */
    function imgurl()
    {
       var id=this.id;
       var server_id=this.server;
       var farm=this.farm;
       var owner=this.owner;
       var secret=this.secret;
       var url="http://farm"+farm+".static.flickr.com/"+server_id+"/"+id+"_"+secret;
       return {
           medium: url + ".jpg",
           square: url + "_s.jpg"
        };
    }

    function callBackArray(data)
    {
        callBack(parseFlickr(data));
    }

    this.doQuery = function(callbackfunc)
    {
        callBack = callbackfunc;

        var querystring ="SELECT * FROM flickr.photos.search WHERE ";
        querystring += "api_key=\"366d86dbf4972dc70d2d9356065dd652\" ";
        querystring += "AND sort=\"relevance\" ";
        querystring += "AND radius=1 ";
        querystring += "AND min_taken_date=\"0\" ";
        if (this.longitude) querystring += "AND lon=\""+this.longitude+"\" ";
        if (this.latitude) querystring += "AND lat=\""+this.latitude+"\" ";
        if (this.searchterm) querystring += "AND text=\""+this.searchterm+"\"";

        $.getJSON('http://query.yahooapis.com/v1/public/yql?q='+escape(querystring)+'&format=json&callback=?',callBackArray);
    }
}
