define(function (require) {
	// define dependencies
	var $ = require("jquery");
	var login = require("login");
	var findMovies = require("findMovies");
	
/**************** LOGIN / LOGOUT *******************/
	// attach click handler to register button
	$(document).on("click","#btn-register", function(event) {
		console.log("You clicked the 'Register' button.");
		login.createNewUser();
	});

	// attach click handler to login button
	$(document).on("click","#btn-login", function(event) {
		console.log("You clicked the 'login' button.");
		login.loginUser();
	});

	// attach click handler to logout button
	$(document).on("click","#btn-logout", function(event) {
		console.log("You clicked the logout btn.");
		login.logout();
	});
 
 /************************FILTERS ************************/
	// attach click handler to 'all' link
	$(document).on("click","#link-all", function(event) {
		console.log("Filtering 'ALL' users movies");
		$("#instructions").remove();
		findMovies.getAllUserMovies()
			.then(function(userMovieData) {
			console.log("userMovies", userMovieData);
			require(["hbs!../templates/filter_results"], function(resultsTemplate) {
				$("#movie-catcher").html(resultsTemplate(userMovieData));
			});
		});
	});
	// attach click handler to 'watched' link
	$(document).on("click","#link-watched", function(event) {
		console.log("Filtering 'WATCHED' users movies");
		$("#instructions").remove();
		var watchedMovies = {};
		findMovies.getAllUserMovies()
			.then(function(userMovieData) {
				for (var movieRefKey in userMovieData) {
					if (userMovieData[movieRefKey].Rating !== "unwatched") {
						watchedMovies[movieRefKey] = userMovieData[movieRefKey];
					}
				}
				console.log("watched movies", watchedMovies);
				require(["hbs!../templates/filter_results"], function(resultsTemplate) {
					$("#movie-catcher").html(resultsTemplate(watchedMovies));
				});
			});
	});
	// attach click handler to 'unwatched' link
	$(document).on("click","#link-unwatched", function(event) {
		console.log("Filtering 'UNWATCHED' users movies");
		$("#instructions").remove();
		var unwatchedMovies = {};
		findMovies.getAllUserMovies()
			.then(function(userMovieData) {
				var movies = userMovieData;
				for (var movieRefKey in movies) {
					if (movies[movieRefKey].Rating === "unwatched") {
						unwatchedMovies[movieRefKey] = movies[movieRefKey];
					}
				}
				console.log("unwatchedMovies",unwatchedMovies);
				require(["hbs!../templates/filter_results"], function(resultsTemplate) {
					$("#movie-catcher").html(resultsTemplate(unwatchedMovies));
				});
			});
	});
	// attach click handler to 'favorites' link
	$(document).on("click","#link-favorites", function(event) {
		console.log("Filtering 'FAVORITES' users movies");
		$("#instructions").remove();
		var favoriteMovies = {};
		findMovies.getAllUserMovies()
			.then(function(userMovieData) {
				var movies = userMovieData;
				for (var movieRefKey in movies) {
					if (movies[movieRefKey].Rating === 5) {
						favoriteMovies[movieRefKey] = movies[movieRefKey];
					}
				}
				console.log("favorite movies", favoriteMovies);
				require(["hbs!../templates/filter_results"], function(resultsTemplate) {
					$("#movie-catcher").html(resultsTemplate(favoriteMovies));
				});
			});
	});

/****************** SEARCH **************************/
	// attach click handler to 'find movies' search button
	$(document).on("keypress","#search-movies", function(event) {
		// console.log("keypress detected: ", event.which);
		if (event.which === 13)
		{
			$("#instructions").remove();
			var userInput = $("#search-movies").val();
			$("#search-movies").val("");
			console.log("user search input = ", userInput);
			var searchResults;
			// search OMDB for movies matching title
			findMovies.searchOMDBMovies(userInput)
				.then(function(OMDBSearchResults) {
					console.log("OMDBSearchResults",OMDBSearchResults);
		   //      		searchResults = OMDBSearchResults;
					// findMovies.getAllUserMovies()
					// 	.then(function( userMoviesToSearch ) {
						
					// 	// at this point, shoudl have OMDB results in searchResults and firebase movies in userMoviesToSearch
		   //      			console.log("OMDB Search Results", searchResults);
					// 	console.log("userMoviesToSearch", userMoviesToSearch);

					// 	// push firebase user movies with matching title to OMDB Search array
					// 	for (var movie in userMoviesToSearch) {
					// 		console.log("movie", userMoviesToSearch[movie].Title);
					// 		var movieTitle = userMoviesToSearch[movie].Title.toLowerCase();
					// 		var userTitleSearch = userInput.toLowerCase();
					// 		if (movieTitle === userTitleSearch) {
					// 		 	searchResults.Search.push(userMoviesToSearch[movie]);
					// 		} // END if
					// 	} // END for-in loop
					// 	console.log("searchResults",searchResults);
					// 	// ***Pass results to HBS template (consider returning movies as object and passing to HBS outside of method?)
			        		
					// 	})
					// 	.fail(function(error) {
					// 		console.log("error", error);
					// 	});

					// JOIN SEARCH RESULTS AND PASS TO HBS

		    		require(["hbs!../templates/find_results"], function(resultsTemplate) {
			   			$("#movie-catcher").html(resultsTemplate(OMDBSearchResults));
				 	});
				})
				.done();
		}
	});

/************************* ADD btn click *************************/
	$(document).on("click", ".btn-add-movie", function(event, imdbID) {

		// create movie data object from OMDB info stored on DOM: MVP needs actors, year, title, and poster
		console.log("event.target", $(event.target));
		var moviePoster = $(event.target.parentElement.firstElementChild.firstElementChild).attr("src");
		var movieTitle = $(event.target.parentElement.firstElementChild.firstElementChild).attr("alt");
		var movieActors = "actors"; // how do we get the actors?
		var movieYear = $(event.target.parentElement.firstElementChild.firstElementChild).attr("year"); // currently stored in HBS template on DOM

		var movieData = {
			"Poster": moviePoster,
			"Title": movieTitle,
			"Year": movieYear,
			"Actors": movieActors
		};

		imdbID = $(this).attr("imdb");  // grab omdbID 
		console.log("imdbID", imdbID);

		// get movie attributes from OMDb
	    $.ajax({ url: "http://www.omdbapi.com/?i=" + imdbID + "&type=movie",
	      method: "GET"
	    })
	      .done(function(json_data) {
	        console.log("omdb json_data", json_data);
	      });






		// store any movie any user adds to a global movies location in firebase
		var moviesRef = new Firebase("https://movieshistory.firebaseio.com/movies");
		// store the returned UID from firebase push to pass to users library of unwatched movies with rating "unwatched"
		// movieRef stores a reference to the path of where we are pushing our data....which is firebase/movies
		// when you use push, Firebase creates a unique id
		var movieRef = moviesRef.push(movieData);
		movieRef = movieRef.toString().split("movies/")[1];
		console.log("movieRef", movieRef);

		// get current auth user ID and store movie under user firebase location
		var authData = moviesRef.getAuth();
		var userRef = new Firebase("https://movieshistory.firebaseio.com/users/" + authData.uid);
		userRef.child(movieRef).set("unwatched");
	});

/*********************** WATCHED btn click ********************/

/*********************** STAR RATING ************************/
	



/********************** Delete Movie click ********************/

	$(document).on("click", "#btn-delete-movie", function(event) {
		console.log("click to delete movie poster");
	});



/********************** Movie Poster Modal click ******************/


	$(document).on("click", ".movieInfo", function(event) {
		console.log("you clicked a movie poster");
		// may need a "display modal call"

		// var movieInfo = {};
		// console.log(event.target);
		

		// // movieInfo.Title = event.target.something something something.attr("alt");
		// movieInfo.Title = $(event.target.parentElement.firstElementChild.firstElementChild).attr("src");

		// // movieInfo.Year = event.target.something something something.attr("year");
		// // movieInfo.Actors = GET INFO FROM DOM
		
		// console.log("movieInfo",movieInfo);

		require(["hbs!../templates/posterModal"], function(poster) {
			$(".movieInfo").html(poster(movieInfo));
		});
	});
});