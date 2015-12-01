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
  searchOMDBMovies: function (searchInput) {
      var deferred = Q.defer();
      // console.log("inside findMovies function");

      // ***format user input for url to be used in ajax call
      searchInput = searchInput.toLowerCase();
      searchInput = searchInput.replace(/ /g, "+");

      // ***submit GET request to OMDB
      $.ajax({url: "http://www.omdbapi.com/?s=" + searchInput + "&r=json"
      }).done( function(searchResults) {
        console.log("inside findMovies done");
        console.log("movies = ", searchResults);
        deferred.resolve(searchResults);
      });
      return deferred.promise;
    },



    /*************** getAllUserMovies ***********/
    getAllUserMovies: function () {
      var deferred = Q.defer();
      var userMovieData = {};
      var tempUserMovieData = {};
      userDataRef.once("value", function(snapshot) {

        // ***The callback function will only get called once since we return true
        // ***get movieRef keys to get data from firebase/movies location
        snapshot.forEach(function(childSnapshot) {

          // ***add rating as key/value pair to tempUserMovieData[movieRef]
          // console.log("childSnapshot key", childSnapshot.key());
          // console.log("childSnapshot val", childSnapshot.val());

          tempUserMovieData[childSnapshot.key()] = {"Rating" : childSnapshot.val()};
          // console.log("tempUserMovieData", tempUserMovieData);
          
          // ******PUT IN METHOD called: getMovieData(movieKey): function() {};
          // ***create reference to firebase movies/movieRef location
          var movieRef = new Firebase("https://movieshistory.firebaseio.com/movies/"+childSnapshot.key());
          
          // ***get snapshot of movies/movieRef data
          movieRef.once("value", function(snapshot) {  
            console.log(snapshot);
            // ***set data at movie location as key/value pair of userMovieData[movieRef]
            userMovieData[snapshot.key()] = snapshot.val();

            // ***combine temp object with user data to 
            userMovieData[snapshot.key()].Rating = tempUserMovieData[snapshot.key()].Rating;
            // console.log("userMovieData", userMovieData);
            deferred.resolve(userMovieData);
          }); // end movieRef.once callback
        }); // end snapshot.forEach callback
      }); // end userDataRef.once callback
    return deferred.promise;
    } // end getAllSUerMovies function

}; // end RETURN

}); // end module
