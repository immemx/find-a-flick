/*
Things to add

No Dups saved and only valid searches are saved DONE

add on reload function so recent searchs populate on reload

add a second text box for the API Key and functionality so user entered API key is passed along

in readme include a blurd explaining the limitations and directions how to get an APIkey for free

look at a modal where search results are returned on a different modal

*/
// variables 
var searchButtonEl = document.getElementsByClassName("btn");
var api = "38c2d6859bmsh6250293f6ae6019p10b60ejsnb83f50f7665d";

const modal = document.querySelector("#modal-info");
var modalError = document.querySelector("#modal-error");
var errorMessage = document.querySelector("#error-msg");

var checkDups = function (title) {
    // define an object of titles 
console.log(localStorage.length);
    for(var i = 0; i < localStorage.length; i++) {
        // pull each item from local storage and compare to user entered value
        var cmp = JSON.parse(localStorage.getItem(i));

        // console.log(cmp);
        // console.log(title);

        // if match is found return TRUE.  It is NOT a unqiue value
        if (cmp === title) {
            return true;
        };
    };
};



var getMovieInfo = function (movie) {

    // OMDB var
    var apiUrl = "https://www.omdbapi.com/?apikey=4ba5eec&t=" + movie;

    // get data through a fetch request
    fetch(apiUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        // Check to see if the response comes back as true or false
        if (data.Response === 'False') {

            errorMessage.textContent = ("That title was not found. Please enter a valid title.")
            // console.log(data)

            modalError.classList.add('is-active');


        } else {

            // console.log(data);
            // console.log(data.Title);

            console.log(checkDups(data.Title));

            if(!checkDups(data.Title)) {
                // if user entered value is unique save the search
                saveSearch(data.Title);
            };

            displayMovieInfo(data);
            // streamingAvailability(data);

            modal.classList.add('is-active')
        }
    })
    .catch(function(error) {
        console.log(error)
    });
};

var streamingAvailability = function (movie) {


    // pull out imdbID for API fetch request
    var imdb_id = movie.imdbID;
    // pull title for error message
    var title = movie.Title;

    // assemble the endpoint URL
    var apiUrl = "https://streaming-availability.p.rapidapi.com/get/basic?country=us&imdb_id=" + imdb_id + "&output_language=en";

    // call with the required header as a second argument
    fetch(apiUrl, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
            "x-rapidapi-key": api
        }
    }).then(function (response) {

        if (response.ok) {
            return response.json();
        } else {
            // create error message if 404 error / no object returned.
            var msg = "We were not able to find streaming availability for " + title + ". Thank you for using find-a-flick!";

            var msgEl = document.createElement("h2");
            msgEl.textContent = (msg);

        }
    }).then(function (data) {
        // pass the data object if it was returned
        displayStreamingLinks(data);
    });

};

var displayMovieInfo = function (data) {

    // document.getElementById("test").innerHTML = "";

    // Create a container to hold information from OMDB and display it

    // Create a title element
    var filmTitle = document.querySelector('#movieTitle')
    // set text to title value from omdb
    filmTitle.textContent = (data.Title)

    // Create an img element 
    var poster = document.querySelector('#movieImg')
    // set source of img as link for poster from omdb
    poster.setAttribute("src", data.Poster)

    // Create text for Year
    var year = document.querySelector('#movieYear')
    // set text of the year to value form omdb
    year.textContent = ("Released: " + data.Year)

    // Create text for Rated
    var rated = document.querySelector('#movieRated')
    // set text to rated value from omdb
    rated.textContent = ("Rated: " + data.Rated)

    // Create text for Runtime
    var runtime = document.querySelector('#movieRuntime')
    // set text to runtime from omdb
    runtime.textContent = ("Runtime: " + data.Runtime)


    // Create text for Plot
    var plot = document.querySelector('#moviePlot')
    // set text for plot from omdb
    plot.textContent = (data.Plot)

};

var displayStreamingLinks = function (data) {

    document.getElementById("linkList").innerHTML = "";
    
    // title variable case sensitive and title is not captialized in the streaming-availability object
    var title = data.title;
    // empty string for success/failure msg
    var msg = "";

    // Use object.keys to create an array of the names of the streaming options available 
    var options = Object.keys(data.streamingInfo);

    if (options[0] == null) {
        // if options array is empty, then the object was returned and no streaming services were found
        // so create a failure message and display it to the user
        msg = "We were not able to find streaming availability for " + title + ". Thank you for using find-a-flick!";

        // populate the h2 header and append to container
        var msgEl = document.createElement("h2")
        msgEl.textContent = (msg);
        

        document.getElementById("linkList").appendChild(msgEl);

    } else {

        // loop through the array of options to access the link for each
        // ex data.streamingInfo[key = netflix].us.link;
        // with each iteration also save the text name of the option.
        for (var i = 0; i < options.length; i++) {
            var key = options[i];
            var link = data.streamingInfo[key].us.link;
            var newTab = "_blank";

            // save the streaming option as a string
            var tempString = options[i];

            // then use charAt() to split off the first character into its own string and capitalize it with toUpperCase
            // then concatenate that with everything after the first character in tempString
            // to receive the service name capitalized.
            var serviceName = tempString.charAt(0).toUpperCase() + tempString.slice(1);

            // create list item and link el
            var optEl = document.createElement("li");
            var linkEl = document.createElement("a");

            // set link to linkS href to go to the streaming service and correct name
            // console.log(link)
            linkEl.setAttribute("href", link);
            // set target to _blank so link opens a new tab
            linkEl.setAttribute("target", newTab);
            linkEl.textContent = (serviceName);
            optEl.appendChild(linkEl);
            // console.log(optEl);

            document.getElementById("linkList").appendChild(optEl);
        };

    }
};

// add onload="test()" to html
// var test = function () {
//     var testStr = "Simpsons";
//     var testStr2 = "Ghostbusters";
//     var testStr3 = "Dark"
//     getMovieInfo(testStr, api);

    // That 70s Show returns an object but no streaming
    // Simpsons returns multiple streaming options
    // Wallace and Gromit 404s and doesen't return an object
// };

var saveSearch = function (title) {
    // use localStorage.length as the key value
    key = localStorage.length;
    var value = title;
    // save user entered title and key to local storage
    localStorage.setItem(key, JSON.stringify(value));

    // create past search element to append to the nav dropdown
    var pastSearch = document.createElement("a");
    pastSearch.setAttribute("id", key);
    pastSearch.setAttribute("class", "navbar-item nav-search");
    pastSearch.textContent = (value);

    // append the elment to nav dropdown
    document.getElementById("recent-search").appendChild(pastSearch);
};

var displaySavedSearches = function () {
    
}

$(".navbar-item").click(function (event) {

    // Prevent page from reloading
    event.preventDefault();
    // console.log("triggered")

    var key = event.target.id; 
    // console.log(key);

    // pull key from local storage
    var api = JSON.parse(localStorage.getItem(key));

    // pull title from local storage. 
    var movieTitle = JSON.parse(localStorage.getItem(key));
    // console.log(movieTitle);

    getMovieInfo(movieTitle)

    modal.classList.add('is-active')

});

