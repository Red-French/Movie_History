define(["jquery", "firebase","Q"],
function($, Firebase,Q) {
  var ref = new Firebase ("https://movieshistory.firebaseio.com/");
  var moviesRef = new Firebase ("https://movieshistory.firebaseio.com/movies/");
  var authData = ref.getAuth();
  var userUID = authData.uid;
  var userDataRef = new Firebase("https://movieshistory.firebaseio.com/users/"+userUID);

return {

  /***********************findOMDBMovies*********************/
      // ***get user input from search box and return object with matching movies from OMDB
  findOMDBMovies: function (searchInput) {
      var deferred = Q.defer();
      // console.log("inside findMovies function");

      // ***format user input for url to be used in ajax call
      searchInput = searchInput.toLowerCase();
      searchInput = searchInput.replace(/ /g, "+");

      // ***submit GET request to OMDB
      $.ajax({url: "http://www.omdbapi.com/?s=" + searchInput + "&r=json",
        method: "GET"
      }).done( function(searchResults) {
        // console.log("inside findMovies done");
         // console.log("movies = ", searchResults);
        deferred.resolve(searchResults);
      });
      return deferred.promise;
    },

    getMoreInfo: function (imdbID) {
      var deferred = Q.defer();

      $.ajax({url: "http://www.omdbapi.com/?i=" + imdbID + "&type=movie",
        method: "GET"
      }).done( function(searchResults) {
        deferred.resolve(searchResults);
      });
      return deferred.promise;
    }

}; // end RETURN

}); // end module
