define(function (require) {
	// define dependencies
	var $ = require("jquery");
	var login = require("login");
	var findMovies = require("findMovies");

	var moviesRef = new Firebase ("https://movieshistory.firebaseio.com/movies/");
	var authData = moviesRef.getAuth();
	var userUID = authData.uid;

	
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

		moviesRef.orderByChild("User").equalTo(userUID).on("value", function(snapshot) {
			console.log("snapshot",snapshot.val());
			require(["hbs!../templates/filter_results"], function(resultsTemplate) {
				$("#movie-catcher").html(resultsTemplate(snapshot.val()));
			});
		});
	
	});

	// attach click handler to 'watched' link
	$(document).on("click","#link-watched", function(event) {
		console.log("Filtering 'WATCHED' users movies");
		
		$("#instructions").remove();
		var userMovies = {};
		var watchedMovies = {};

		moviesRef.orderByChild("User").equalTo(userUID).once("value", function(snapshot) {
			userMovies = snapshot.val();

			for (var movieKey in userMovies) {
				// check for Rating of unwatched
				if (userMovies[movieKey].Rating !== 0) {
					watchedMovies[movieKey] = userMovies[movieKey];
				}
			}
			// console.log("watchedMovies", watchedMovies);
			// pass watched movies to HBS template
			require(["hbs!../templates/filter_results"], function(resultsTemplate) {
				$("#movie-catcher").html(resultsTemplate(watchedMovies));
			});
		
		});
	
	});

	// attach click handler to 'unwatched' link
	$(document).on("click","#link-unwatched", function(event) {
		console.log("Filtering 'UNWATCHED' users movies");
		$("#instructions").remove();
		var userMovies = {};
		var unwatchedMovies = {};

		moviesRef.orderByChild("User").equalTo(userUID).once("value", function(snapshot) {
			userMovies = snapshot.val();

			for (var movieKey in userMovies) {
				// check for Rating of unwatched
				if (userMovies[movieKey].Rating === 0) {
					unwatchedMovies[movieKey] = userMovies[movieKey];
				}
			}
			// console.log("watchedMovies", watchedMovies);
			// pass watched movies to HBS template
			require(["hbs!../templates/filter_results"], function(resultsTemplate) {
				$("#movie-catcher").html(resultsTemplate(unwatchedMovies));
			});
		
		});
	});
	// attach click handler to 'favorites' link
	$(document).on("click","#link-favorites", function(event) {
		console.log("Filtering 'FAVORITES' users movies");
	});

/****************** SEARCH **************************/
	// attach click handler to 'find movies' search button
	$(document).on("keypress","#search-movies", function(event) {
		// console.log("keypress detected: ", event.which);
		if (event.which === 13)
		{
			// Remove instructions
			$("#instructions").remove();
			var userInput = $("#search-movies").val();
			
			// query OMDB API
			$("#search-movies").val("");
			// search OMDB for movies matching title
			findMovies.findOMDBMovies(userInput)
				.then(function(OMDBSearchResults) {
					
		        		require(["hbs!../templates/find_results"], function(resultsTemplate) {
		      			$("#movie-catcher").html(resultsTemplate(OMDBSearchResults));
			  		});
				})
				.fail(function(error) {
					console.log("error", error);
				})
				.done();
		}
	});

/************************* ADD btn click *************************/
	$(document).on("click", ".btn-add-movie", function(event) {
		var imdbID = $(this).attr("imdbID");
		
		// when user adds movie, get additional info from OMDB
		findMovies.getMoreInfo(imdbID)
			.then(function(movieInfo) {
				console.log("moreInfo", movieInfo);
				var movieData = {
					"Poster": movieInfo.Poster,
					"Title": movieInfo.Title,
					"Year": movieInfo.Year,
					"Actors": movieInfo.Actors,
					"imdbID": movieInfo.imdbID,
					"Rating": 0,
					"Stars": 0,
					"User": authData.uid
				};
				// push movie and data to firebase
				console.log("movieDataToAdd",movieData);
				moviesRef.push(movieData);
			})
			.fail(function(error) {
				console.log("error", error);
			})
			.done();
	});

/*********************** Watched btn movie handler ************************/
	$( document ).on( "click", ".btn-watched-movie", function(event) {
		console.log("btn-watched-movie clicked");
		var movieWatchedKey = $(this).attr("firebase-key");
		var movieWatchedRef = new Firebase( "https://movieshistory.firebaseio.com/movies/"+movieWatchedKey);
		movieWatchedRef.child("Rating").set(1);
		console.log("delete me", $(event.target.parentElement));
		$( event.target.parentElement).remove();

		// set value of Rating to 1
		// Set value of Stars to 0
	});

/*********************** Stars Rating*******************************/
	$( document ).on( "click",".starz", function( event ) {
		console.log("star click");
	});
	$( document ).on( "mouseover",".starz", function( event ) {
		console.log("hover detected");

		console.log($(this).attr('src'));
		$(this).attr("src", "");
	});


/*********************** Movie Poster Click Modal*******************************/
	$( document ).on( "click",".movie-poster", function( event ) {
		console.log("poster click");
		console.log("imdbID",imdbID);
		var imdbID = $(this).attr("imdbID");
		findMovies.getMoreInfo(imdbID)
			.then( function(movieInfo) {
				console.log("movieInfo",movieInfo);
				require(["hbs!../templates/posterModal"], function(Template) {
					$("#movie-modal-content").html(Template(movieInfo));
				});
			})
			.fail(function(error) {
				console.log("error", error);
			})
			.done();
	});





/********************** Delete Movie click ********************/

	$( document ).on( "click", "#btn-delete-movie", function( event ) {
		// remove movie poster and info from DOM
		console.log($(event.target.parentElement.parentElement));
		$( event.target.parentElement.parentElement.remove() );

		// make firebase location unavailable HERE

	});	

});