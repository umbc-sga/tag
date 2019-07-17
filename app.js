var app = angular.module("umbc-tag", ["firebase", "ngRoute"]);

/**
 * A directive that waits until the last element has been put on the template to scroll to the proper element.
 */
app.directive('myPostRepeatDirective', ['$anchorScroll', '$location', function (anchorScroll, location) {
    return function (scope, element, attrs) {
        if (scope.$last) {
            scope.$evalAsync(function() {
                if (scope.activityLink) {
                    location.hash(scope.activityLink);
                    anchorScroll();
                }
            });
        }
    };
}]);

/**
 * Handle application routing so that it is all in one page.
 */
app.config(["$routeProvider", "$locationProvider", "$anchorScrollProvider", function($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');

    $routeProvider
        .when("/", {
            templateUrl: "templates/home.html",
            controller: 'HomeCtrl'
        })
        .when("/admin", {
            templateUrl: "templates/admin.html",
            controller: 'AdminCtrl'
        })
        .when("/arbutus", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/arbutus/:activity", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/arundel", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/arundel/:activity", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/catonsville", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/catonsville/:activity", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/courtney", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/courtney/:activity", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/downtown", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/downtown/:activity", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/route-40", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/route-40/:activity", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/find", {
            templateUrl: "templates/find.html",
            controller: "FindCtrl"
        })
        .when("/routes", {
            templateUrl: "templates/routes.html",
            controller: "RoutesCtrl"
        })
        .when("/suggest", {
            templateUrl: "templates/suggest.html",
            controller: 'SuggestCtrl'
        })
        .otherwise({
            redirectTo: "/"
        });
}]);

/**
 * Add proper capitalization to inputted word and output it.
 */
app.filter('capitalize', function () {
    return function (input) {
        // Capitalize the first letter of the string
        return input[0].toUpperCase() + input.substring(1);
    };
});

/**
 * Handle the homepage logic.
 */
app.controller("HomeCtrl", function($scope, $firebaseObject) {
    // Acccess the destination catalog database
    var ref = firebase.database().ref().child("catalog");
    $scope.catalog = $firebaseObject(ref);

    // Scroll to top of page on load
    window.scrollTo(0, 0);

    /**
     * Cache the database values.
     */
    firebase.database().ref('/catalog').once('value').then(function(snapshot) {
        var catalog = snapshot.val(); 

        if (catalog) localStorage.setItem("catalog", JSON.stringify(catalog));
    });

    /**
     * Get the number of things to do on that route.
     */
    $scope.getNumDestinations = function(route) {
        var numDestinations = 0;

        // Go through every single stop on route and count destinations
        for (var stop of route.stops) {
            for (var destination of stop.destinations) {
                if (destination.title) numDestinations++;
            }
        }
        
        return numDestinations;
    };
});

/**
 * Handle the routes page logic.
 */
app.controller("RoutesCtrl", function ($scope, $firebaseObject) {
    // Acccess the destination catalog database
    var ref = firebase.database().ref().child("catalog");
    $scope.catalog = $firebaseObject(ref);

    // Scroll to top of page on load
    window.scrollTo(0, 0);

    /**
     * Get the number of things to do on that route.
     */
    $scope.getNumDestinations = function (route) {
        var numDestinations = 0;

        // Go through every single stop on route and count destinations
        for (var stop of route.stops) {
            for (var destination of stop.destinations) {
                if (destination.title) numDestinations++;
            }
        }

        return numDestinations;
    };
});

/**
 * Replace all occurences of a substring in a string.
 */
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * Create links from free text.
 */
function linkify(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

/**
 * Handle the route pages logic.
 */
app.controller("RouteInfoCtrl", function($scope, $location, $routeParams, $sce, $firebaseObject) {
    // If there is no specific activity link
    if (!$routeParams.activity) {
        $scope.route = $location.url().replace("/", "");

        // Scroll to top of page on load
        window.scrollTo(0, 0);
    }
    else {
        var url = $location.url().substring(1);
        $scope.route = url.substring(0, url.indexOf("/"));

        $scope.activityLink = $routeParams.activity;
    }

    // Acccess the destination catalog database at the specific route
    var ref = firebase.database().ref().child("catalog").child($scope.route);
    $scope.catalog = $firebaseObject(ref);
    
    /**
     * Copy the shareable link onto the clipboard.
     */
    $scope.copyLink = function(link, event) {
        // If shareLink exists elsewhere, remove it
        if ($("#shareLink").length) $("#shareLink").remove();

        // Add the shareLink input
        $(event.target).parent().append("<input class='mt-3' id='shareLink' type='text' readonly/>");

        // Create shareLink from data from the element on the apge
        var shareLink = $location.absUrl().split('#')[0];
        shareLink += "#/" + $scope.route + "/" + link;

        // Set the shareLink input value to the share link
        var input = document.getElementById("shareLink");
        input.value = shareLink;

        $('body').bind('touchmove', function (e) { e.preventDefault(); return false; });

        // If on iOS, set the selection range
        if (navigator.userAgent.match(/iPad|iPhone/i)) {
            input.focus({preventScroll: true});
            input.setSelectionRange(0, 9999);   
        }
        // Otherwise, just select
        else {
            input.focus({ preventScroll: true });
            input.select();
        }

        // Copy to clipboard
        var test = document.execCommand("copy");

        // If successful, alert the user and hide shareLink input
        if (test) {
            document.getElementById("shareLink").style.display = "none";
            alert("The shareable link was saved to the clipboard.");
            $('body').unbind('touchmove');
        }
    };

    /**
     * Santize HTML and allow Angular to display it as HTML.
     */
    $scope.to_trusted = function(html_code) {
        if (html_code) {
            // Create links
            html_code = linkify(html_code);

            // Preserve newlines
            html_code = html_code.replaceAll("\n", "<br>");
        }
        
        return $sce.trustAsHtml(html_code);
    };
});

/**
 * Handle the Suggestion page logic.
 */
app.controller("SuggestCtrl", function($scope, $firebaseArray, $firebaseObject) {
    var ref = firebase.database().ref().child("ice-box");
    var list = $firebaseArray(ref);

    // Scroll to top of page on load
    window.scrollTo(0, 0);

    /**
     * Wait for the user to select a route, then store it in the scope.
     */
    $scope.$watch('route', function() {
        if ($scope.route) {
            // Acccess the destination catalog database at the specific route
            var newRef = firebase.database().ref().child("catalog").child($scope.route);
            $scope.catalog = $firebaseObject(newRef);
        }
    }, true);
  
    /**
     * Add a destination into the icebox, which is reviewed by admins.
     */
    $scope.suggestDestination = function() {
        list.$add({
            'title': $scope.title,
            'route': $scope.route,
            'stopName': $scope.stopName,
            'address': $scope.address || 'N/A',
            'website': $scope.website || 'N/A',
            'additionalInformation': $scope.additionalInformation || 'N/A'
        }).then(function() {
            alert($scope.title + " was successfully suggested!");
        });
    };
});

/**
 * Handle the find page logic.
 */
app.controller("FindCtrl", function($scope, $firebaseObject, $location, $sce) {
    // Acccess the destination catalog database
    var ref = firebase.database().ref().child("catalog");
    $scope.catalog = $firebaseObject(ref);

    // Scroll to top of page on load
    window.scrollTo(0, 0);

    // Array to hold the sorted activities that the user has filtered
    $scope.sortedActivities = [];

    // Default sort options
    $scope.costOption = "paidFree";
    $scope.tripTime = "weekday";
    $scope.categories = [];

    /**
     * Enable live search results.
     */
    $scope.$watch('query', function() {
        // If the user is searching something
        if ($scope.query) {
            // Hide the sorter div when searching
            document.getElementById("sorter").style.display = 'none';

            // Reset sorted activities each time
            $scope.sortedActivities = [];

            // For every route 
            angular.forEach($scope.catalog, function(value, route) {
                var stops = $scope.catalog[route].stops;

                // For every stop
                for (var i = 0; i < stops.length; i++) {
                    var currentStop = stops[i];

                    // For every activity
                    var activities = currentStop.destinations;
                    for (var j = 0; j < activities.length; j++) {
                        var currentActivity = activities[j];
                        var keys = Object.keys(currentActivity);

                        // If the object is a complete activity
                        if (keys.includes("title")) {
                            // For every field, search for the query
                            for (var key of keys) {
                                // Lowercase as much as possible
                                var query = $scope.query.toLowerCase();
                                var actCompare = Object.assign(currentActivity);
                                var comparison = typeof actCompare[key] == "string" ? actCompare[key].toLowerCase() : actCompare[key];

                                // If the comparison value is an array, stringify and lowercase
                                if (Array.isArray(comparison)) comparison = comparison.join(" ").toLowerCase();

                                // Deep copy object and get lowercase stop name to compare
                                var stopCompare = Object.assign(currentStop);
                                var stopName = stopCompare.name;
                                stopName = stopName.toLowerCase();
                                
                                // If the comparison value includes the query
                                if (comparison.includes(query) || stopName.includes(query) 
                                    || route.includes(query))
                                {
                                    // Create activity to be added to sortedActivities
                                    var activity = { 'route': route, 'stop': currentStop, 'data': currentActivity };

                                    // If the activity is not already included, add it
                                    if (!$scope.sortedActivities.includes(activity)) {
                                        $scope.sortedActivities.push(activity);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        // If the user isn't searching anything
        else if ($scope.query == '' || !$scope.query) {
            $scope.sortedActivities = [];
            document.getElementById("sorter").style.display = '';
        }
    }, true);

    /**
     * Clear the results of user search or sort.
     */
    $scope.clearResults = function() {
        // Reset cost selector
        document.getElementById("paid").className = "page-item";
        document.getElementById("free").className = "page-item";
        document.getElementById("paidFree").className = "page-item active";

        // Reset weekday selector
        document.getElementById("weekday").className = "page-item";
        document.getElementById("weekend").className = "page-item";
        document.getElementById("weekdayWeekend").className = "page-item active";

        // Reset category selector
        document.getElementById("Entertainment").className = "list-group-item";
        document.getElementById("Food").className = "list-group-item";
        document.getElementById("Outdoor").className = "list-group-item";
        document.getElementById("Shopping").className = "list-group-item";

        // Reset search and sortedActivities store
        $scope.query = "";
        $scope.sortedActivities = [];

        // Reset sort options to default
        $scope.costOption = "paidFree";
        $scope.tripTime = "weekday";
        $scope.categories = [];
    };
    
    /**
     * Set the cost option to sort by.
     */
    $scope.setCostOption = function(costOption) {
        document.getElementById("paid").className = "page-item";
        document.getElementById("free").className = "page-item";
        document.getElementById("paidFree").className = "page-item";
        
        document.getElementById(costOption).className = "page-item active";
        $scope.costOption = costOption;
    };

    /**
     * Set the trip time to sort by.
     */
    $scope.setTripTime = function(tripTime) {
        document.getElementById("weekday").className = "page-item";
        document.getElementById("weekend").className = "page-item";
        document.getElementById("weekdayWeekend").className = "page-item";

        document.getElementById(tripTime).className = "page-item active";
        $scope.tripTime = tripTime;
    };

    /**
     * Add a category 
     */
    $scope.addCategory = function(category) {
        // If the item has not been selected yet
        if (document.getElementById(category).className == "list-group-item") {
            // Show the item as selected
            document.getElementById(category).className = "list-group-item active";

            // Add the item to the categories array
            $scope.categories.push(category);
        }
        // If the item has already been selected
        else {
            // De select the item
            document.getElementById(category).className = "list-group-item";

            // Remove the category from the array
            $scope.categories.splice($scope.categories.indexOf(category), 1);
        }
    };

    /**
     * Sort activities based on what categories are picked.
     */
    $scope.sortActivities = function() {
        // Scroll to results section so user knows
        document.getElementById("results").scrollIntoView({ behavior: "smooth" });

        // Run the activities catalogs through the sort functions
        $scope.sortedActivities = sortByPrice($scope.catalog, $scope.costOption);
        $scope.sortedActivities = sortByCategory($scope.sortedActivities, $scope.categories);
        $scope.sortedActivities = sortByTime($scope.sortedActivities, $scope.tripTime);
    };

    /**
    * Copy the shareable link onto the clipboard.
    */
    $scope.copyLink = function(activity) {
        var route = activity.route;
        var stops = $scope.catalog[route].stops;
        
        // Go through every stop in the route
        for (var i = 0; i < stops.length; i++) {
            var activities = stops[i].destinations;

            // Go through every activity in the stop
            for (var j = 0; j < activities.length; j++) {
                var currentActivity = activities[j];

                // If the activity is not null
                if (currentActivity) {
                    // If the activity in the find section matches whatever is in the database
                    if (activity.stop.name == stops[i].name && activity.data.title == currentActivity.title) {
                        // Get the stopIndex and activityIndex and put into share link URL
                        var shareLink = $location.absUrl().split('#')[0];
                        shareLink += "#/" + route + "/" + i + "-" + j;

                        // If share link input exists somewhere else, remove it
                        if ($("#shareLink").length) $("#shareLink").remove();

                        // Add a shareLink input to the activity div
                        $(event.target).parent().append("<input class='mt-3' id='shareLink' type='text' readonly/>");

                        // Set the input value to the shareLink
                        var input = document.getElementById("shareLink");
                        input.value = shareLink;

                        $('body').bind('touchmove', function (e) { e.preventDefault(); return false; });

                        // If it is on iOS set selection range
                        if (navigator.userAgent.match(/iPad|iPhone/i)) {
                            input.focus({ preventScroll: true });
                            input.setSelectionRange(0, 9999);
                        }
                        // If anything else, just select
                        else {
                            input.focus({ preventScroll: true});
                            input.select();
                        }

                        // Copy to the clipboard
                        var test = document.execCommand("copy");

                        // If successful, alert the user and also hide shareLink
                        if (test) {
                            document.getElementById("shareLink").style.display = "none";
                            alert("The shareable link was saved to the clipboard.");
                            $('body').unbind('touchmove');
                        }
                    }
                }
            }
        }
    };

    /**
     * Santize HTML and allow Angular to display it as HTML.
     */
    $scope.to_trusted = function(html_code) {
        if (html_code) {
            // Create links
            html_code = linkify(html_code);

            // Preserve newlines
            html_code = html_code.replaceAll("\n", "<br>");
        }

        return $sce.trustAsHtml(html_code);
    };
});

/**
 * Sort the elements by if the user wants to spend money or not for the activity.
 * @param {JSON} catalog 
 * @param {string} option 
 */
function sortByPrice(catalog, option) {
    var sortedActivities = [];

    angular.forEach(catalog, function (value, key) {
        var route = key;
        var stops = value.stops;

        for (var stop of stops) {
            // For every activity in that stop
            for (var activity of stop.destinations) {
                var categories = activity.categories;

                if (option == 'paidFree' || (categories && categories.includes(option)))
                    sortedActivities.push({ 'route': route, 'stop': stop, 'data': activity });
            }
        }
    });

    return sortedActivities;
}

/**
 * Sort the activities by what kind of activity it is.
 * @param {array} activities 
 * @param {string} activityTypes 
 */
function sortByCategory(activities, activityTypes) {
    var sortedActivities = [];

    for (var activity of activities) {
        var categories = activity.data.categories;

        // If the activity has a category list
        if (categories && categories != "N/A") {
            for (var type of activityTypes) {
                if (categories.includes(type) && !sortedActivities.includes(activity))
                    sortedActivities.push(activity);
                else if (activityTypes && activityTypes[0] == "All")
                    sortedActivities.push(activity);
            }
        }
    }

    return sortedActivities;
}

/**
 * Sort by when the bus runs.
 * @param {array} activities 
 * @param {string} time 
 */
function sortByTime(activities, time) {
    var sortedActivities = [];

    for (var activity of activities)  {
        var route = activity.route;

        if (["arundel", "route-40"].includes(route) && time == "weekend") 
            sortedActivities.push(activity);
        else if (!["arundel", "route-40"].includes(route) && time == "weekday") 
            sortedActivities.push(activity);
        else if (!["arundel", "route-40"].includes(route) && time == "weekend") 
            sortedActivities.push(activity);
        else if (time == "weekdayWeekend")
            sortedActivities.push(activity);
    }

    return sortedActivities;
}

/**
 * Handle the admin page logic.
 */
app.controller("AdminCtrl", function ($scope, $firebaseObject, $firebaseArray) {
    // Acccess the destination catalog database
    var ref = firebase.database().ref().child("catalog");
    $scope.catalog = $firebaseObject(ref);

    // The ice box is a part of the database that is not viewable by users and only by admins
    var iceBoxRef = firebase.database().ref().child("ice-box");
    $scope.iceBox = $firebaseArray(iceBoxRef);

    /**
     * Get the stop from the route.
     */
    $scope.getStop = function(stopName) {
        if (!stopName) return;

        for (var i = 0; i < $scope.catalog[$scope.route].stops.length; i++) {
            var stop = $scope.catalog[$scope.route].stops[i];

            if (stop.name == stopName) {
                $scope.stopIndex = i;
                return stop;
            }
        }
    };

    /**
     * Get the destinations from the stop title for destination editing.
     */
    $scope.$watch("stopInfo.title", function() {
        if ($scope.stopInfo) {
            var destinations = $scope.getStop($scope.stopName).destinations;

            for (var i = 0; i < destinations.length; i++) {
                var destination = destinations[i];

                if (destination.title == $scope.stopInfo.title) {
                    $scope.destinationIndex = i;
                    $scope.destination = destination;
                }      
            }

            $scope.title = $scope.stopInfo.title;
        }
    }, true);

    /**
     * Add a new destination from scratch to a stop.
     */
    $scope.addDestination = function() {
        // Find the stop number we are adding a destination to
        var stopIndex;
        for (var i = 0; i < $scope.catalog[$scope.route].stops.length; i++) {
            // Get the current stop
            var test = $scope.catalog[$scope.route].stops[i];

            // Check if the current stop is the stop that the user selected in the form
            if (test.name == $scope.stopName) stopIndex = i;
        }

        // If there are no other destinations in the array
        if ($scope.catalog[$scope.route].stops[stopIndex].destinations.includes("Nothing has been reported for this stop yet.")) {
            // Override the first element in the array that says nothing has been reported yet
            $scope.catalog[$scope.route].stops[stopIndex].destinations[0] = {
                title: $scope.title,
                address: $scope.address || "N/A",
                website: $scope.website || "N/A",
                categories: $scope.categories || "N/A",
                additionalInformation: $scope.additionalInformation || "N/A"
            };
        }
        // If there are already destinations in the array
        else {
            // Append the element to the end of the array
            $scope.catalog[$scope.route].stops[stopIndex].destinations.push({
                title: $scope.title,
                address: $scope.address || "N/A",
                website: $scope.website || "N/A",
                categories: $scope.categories || "N/A",
                additionalInformation: $scope.additionalInformation || "N/A"
            });
        }

        // Save the new destination to the database
        $scope.catalog.$save().then(function() {
            alert($scope.title + " was added to the database!");
        });
    };

    /**
     * Edit an existing destination's information.
     */
    $scope.editDestination = function() {
        // Edit destination
        $scope.catalog[$scope.route].stops[$scope.stopIndex].destinations[$scope.destinationIndex] = {
            title: $scope.title,
            address: $scope.destination.address || "N/A",
            website: $scope.destination.website || "N/A",
            categories: $scope.destination.categories || "N/A",
            additionalInformation: $scope.destination.additionalInformation || "N/A"
        };

        // Save to catalog
        $scope.catalog.$save().then(function() {
            alert($scope.title + " was successfully edited!");
        });
    };

    /**
     * Move the suggested destination from the icebox to the catalog.
     */
    $scope.approveSuggestion = function(item) {
        // Find the stop number we are adding a destination to
        var stopIndex;
        for (var i = 0; i < $scope.catalog[item.route].stops.length; i++) {
            // Get the current stop
            var test = $scope.catalog[item.route].stops[i];

            // Check if the current stop is the stop that the user selected in the form
            if (test.name == item.stopName) stopIndex = i;
        }

        // If there are no destinations already in the array
        if ($scope.catalog[item.route].stops[stopIndex].destinations.includes("Nothing has been reported for this stop yet.")) {
            // Override the first element in the array that says nothing has been reported yet
            $scope.catalog[item.route].stops[stopIndex].destinations[0] = {
                title: item.title,
                address: item.address,
                website: item.website,
                additionalInformation: item.additionalInformation
            };
        }
        // If there are already destinations in the array
        else {
            // Append the element to the end of the array
            $scope.catalog[item.route].stops[stopIndex].destinations.push({
                title: item.title,
                address: item.address,
                website: item.website,
                additionalInformation: item.additionalInformation
            });
        }

        // Save the approved destination to the catalog
        $scope.catalog.$save().then(function() {
            // Store the title
            var title = item.title;

            // Remove the approved destination from the icebox
            $scope.iceBox.$remove(item).then(function () {
                alert(title + " was rejected and successfully purged from the database.");
            });
        });
    };

    /**
     * Remove the suggestion from the icebox.
     */
    $scope.rejectSuggestion = function(item) {
        // Store the title
        var title = item.title;

        // Remove the item from the icebox
        $scope.iceBox.$remove(item).then(function() {
            alert(title + " was rejected and successfully purged from the database.");
        });
    };
});