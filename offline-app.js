var app = angular.module("umbc-tag", ["ngRoute"]);

/**
 * Handle application routing so that it is all in one page.
 */
app.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
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
        .when("/arundel", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/catonsville", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/courtney", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/downtown", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/route-40", {
            templateUrl: "templates/route.html",
            controller: 'RouteInfoCtrl'
        })
        .when("/plan", {
            templateUrl: "templates/plan.html",
            controller: "PlanCtrl"
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
app.controller("HomeCtrl", function ($scope) {
    // Acccess the destination catalog database
    $scope.catalog = JSON.parse(localStorage.getItem('catalog'));

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
 * Handle the routes page logic.
 */
app.controller("RoutesCtrl", function ($scope) {
    // Acccess the destination catalog database
    $scope.catalog = JSON.parse(localStorage.getItem('catalog'));

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
app.controller("RouteInfoCtrl", function ($scope, $location, $sce) {
    // Get the route name from the URL
    $scope.route = $location.url().replace("/", "");

    // Scroll to top of page on load
    window.scrollTo(0, 0);

    // Acccess the destination catalog database at the specific route
    $scope.catalog = JSON.parse(localStorage.getItem('catalog'))[$scope.route];

    /**
     * Santize HTML and allow Angular to display it as HTML.
     */
    $scope.to_trusted = function (html_code) {
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
 * Handle the planning page logic.
 */
app.controller("PlanCtrl", function ($scope, $sce) {
    // Acccess the destination catalog database
    $scope.catalog = JSON.parse(localStorage.getItem('catalog'));
    
    // Scroll to top of page on load
    window.scrollTo(0, 0);

    $scope.sortedActivities = [];

    $scope.costOption = "paidFree";
    $scope.tripTime = "weekday";
    $scope.categories = [];

    /**
     * Set the cost option to sort by.
     */
    $scope.setCostOption = function (costOption) {
        document.getElementById("paid").className = "page-item";
        document.getElementById("free").className = "page-item";
        document.getElementById("paidFree").className = "page-item";

        document.getElementById(costOption).className = "page-item active";
        $scope.costOption = costOption;
    };

    /**
     * Set the trip time to sort by.
     */
    $scope.setTripTime = function (tripTime) {
        document.getElementById("weekday").className = "page-item";
        document.getElementById("weekend").className = "page-item";
        document.getElementById("weekdayWeekend").className = "page-item";

        document.getElementById(tripTime).className = "page-item active";
        $scope.tripTime = tripTime;
    };

    /**
     * Add a category 
     */
    $scope.addCategory = function (category) {
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
    $scope.sortActivities = function () {
        // Scroll to results section so user knows
        document.getElementById("results").scrollIntoView({ behavior: "smooth" });

        // Run the activities catalogs through the sort functions
        $scope.sortedActivities = sortByPrice($scope.catalog, $scope.costOption);
        $scope.sortedActivities = sortByCategory($scope.sortedActivities, $scope.categories);
        $scope.sortedActivities = sortByTime($scope.sortedActivities, $scope.tripTime);
    };

    /**
     * Santize HTML and allow Angular to display it as HTML.
     */
    $scope.to_trusted = function (html_code) {
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

    for (var activity of activities) {
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