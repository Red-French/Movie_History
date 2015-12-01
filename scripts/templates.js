define(function (require) {
	return {
		loadSplash: function () {
			require(["hbs!../templates/splash"], function (throwSplash) {
				$("#catcher").html(throwSplash);
			});
		},

		loadInitialPage: function() {
			require(["hbs!../templates/initial_page"], function (throwInitialPage) {
				$("#catcher").html(throwInitialPage);
			});
		}	
	};
});