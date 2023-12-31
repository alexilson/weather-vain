const apiKey = "3f72ddeed10ffe4814723bf1b93c4536";
const searchStringEl = $('#search-string');
const searchOutputEl = $('#search-output');
const currentCityEl = $('#current-city');
const searchHistoryListEl = $('#search-history-list');

// gets the search history from local storage, or creates it
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];


// converts UTC in seconds to milliseconds then to the browser's local date
function convertDate(utcDate) {
    return new Date(utcDate * 1000).toLocaleString(
        'en-US', {
        weekday: 'long',
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }
    )
}

// when provided with the api response and a integer for the specific forecast, returns a fully built
// weather tile element.
function createWeatherTileEl(data, num) {

    // create weather tile element
    const weatherEl = $('<div>');

    // add date
    const dateEl = $('<h3>');
    dateEl.text(convertDate(data.list[num].dt));
    weatherEl.append(dateEl);

    // add icon
    const iconEl = $('<img>');
    iconEl.attr('src', `https://openweathermap.org/img/wn/${data.list[num].weather[0].icon}.png`);
    weatherEl.append(iconEl);

    // add temp
    const tempEl = $('<div>');
    tempEl.text(`Temp: ${data.list[num].main.temp} °F`);
    weatherEl.append(tempEl);

    // add wind
    const windEl = $('<div>');
    windEl.text(`Wind: ${data.list[num].wind.speed} MPH`);
    weatherEl.append(windEl);

    // add humidity
    const humidityEl = $('<div>');
    humidityEl.text(`Humidity: ${data.list[num].main.humidity}%`);
    weatherEl.append(humidityEl);

    return weatherEl;
}

// sends the contents of the search box to the geocoding api and displays results in real time below the search box.
// puts the lon/lat into the html attribute for each result to be passed to the request for weather data
function submitData() {

    // grab the input
    inputValue = searchStringEl.val();
    
    // if it's 2 or less, don't send it yet. 3 characters is a single character plus a comma plus a space, which should cover all cases.
    if (inputValue.length < 3) {
        return;
    }

    // if it's 3 or more, send the request.
    // Limited to 5 responses.
    const apiGeocodingURL = `https://api.openweathermap.org/geo/1.0/direct?q=${inputValue}&limit=5&appid=${apiKey}`
    fetch(apiGeocodingURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.length > 0) {

                // clear out previous results
                searchOutputEl.empty();

                // render the results as div elements appended to the search box with the lat/lon as html attributes of the elements.
                for (let i = 0; i < data.length; ++i) {
                    const outputListEl = $('<div>');

                    // logic for displaying states if the attribute exists
                    if (data[i].state) {
                        outputListEl.text(data[i].name + ", " + data[i].state + ", " + data[i].country);
                    }
                    else {
                        outputListEl.text(data[i].name + ", " + data[i].country);
                    }
                    outputListEl.addClass('search-result');
                    outputListEl.attr('num', i);
                    outputListEl.attr('lon', data[i].lon);
                    outputListEl.attr('lat', data[i].lat);
                    searchOutputEl.append(outputListEl);
                }
            }
        });
}

// looks for the user to press enter on the search box and sends the first result to the weather api
function handleKeydown(event) {
    if (event.key === 'Enter') {
        const result = $('.search-result[num="0"]')
        return getWeatherData(result.text(), [result.attr("lat"), result.attr("lon")]);
    }
}

// looks for user to click on one of the search results
function handleClick() {
    const selectedEl = $(this);
    return getWeatherData(selectedEl.text(), [selectedEl.attr("lat"), selectedEl.attr("lon")]);
}

// render the search history from local storage
function showSearchHistory() {

    // empty out any previous history being displayed
    searchHistoryListEl.empty();

    // creates an html element for each item in local storage with the city name and coordinates as html attributes
    for (let i = 0; i < searchHistory.length; ++i) {
        const item = searchHistory[i];
        const searchHistoryItemEl = $('<div>');
        searchHistoryItemEl.text(item['city']);
        searchHistoryItemEl.addClass('search-history-item');
        searchHistoryItemEl.attr('num', i);
        searchHistoryItemEl.attr('lat', item['coordinates'][0]);
        searchHistoryItemEl.attr('lon', item['coordinates'][1]);
        searchHistoryListEl.append(searchHistoryItemEl);
    }
}

// puts the city and coordinates into local storage, limits the number of items that can be saved
function addSearchHistory(city, coordinates) {
    searchHistory.unshift({ city, coordinates});
    const maxSearchHistory = 20;
    searchHistory = searchHistory.slice(0, maxSearchHistory);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    return showSearchHistory();
}

// stores city/coordinates in local storage, sends coordinates to weather api and retrieves weather data, then renders the weather section html.
function getWeatherData(city, coordinates) {

    // clean up dynamically rendered html
    searchOutputEl.empty();
    currentCityEl.empty();
    searchStringEl.val('');

    // save parameters to local storage
    addSearchHistory(city, coordinates);

    // assign variables for url string interpolation
    const latSelect = coordinates[0];
    const lonSelect = coordinates[1];
    const apiWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latSelect}&lon=${lonSelect}&units=imperial&appid=${apiKey}`;
    
    // call the url and process the data
    fetch (apiWeatherURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            // display city name
            const cityNameEl = $('<h2>');
            cityNameEl.text(city);
            currentCityEl.append(cityNameEl);

            // display text that says "Current Conditions"
            $('#current-conditions').text("Current Conditions");

            // add tile with date, icon, temp, wind, humidity and append it to #current-conditions
            const tileEl = createWeatherTileEl(data, 0);
            $('#current-conditions').append(tileEl);

            // display text that says "Future Conditions"
            $('#next-5-conditions').text("Future Conditions");

            // display the next 5 days, the weather forecasts come back in 3 hour increments, 8 of these make a day
            // so the loop iterates by 8 each time, starting with 7 due to the zero index and ending at 39.
            for (let i = 7; i < 40; i+=8) {
                const forecastTileEl = createWeatherTileEl(data, i);
                $('#next-5-conditions').append(forecastTileEl);
            }
        })
}

// event handler to send input to geolocation service as user types
searchStringEl.on("input", submitData)

// event handler for clicking on search results
searchOutputEl.on("click", ".search-result", handleClick)

// event handler for search history list, uses the same response as clicking a search item
searchHistoryListEl.on("click", ".search-history-item", handleClick)

// checking if they pressed enter
searchStringEl.on("keydown", handleKeydown);

showSearchHistory();