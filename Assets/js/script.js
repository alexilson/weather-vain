const apiKey = "3f72ddeed10ffe4814723bf1b93c4536";
const searchStringEl = $('#search-string');
const searchOutputEl = $('#search-output');
const currentCityEl = $('#current-city');
const searchHistoryEl = $('#search-history');
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

function submitData() {
    inputValue = searchStringEl.val();
    if (inputValue.length < 3) {
        return;
    }
    const apiGeocodingURL = `https://api.openweathermap.org/geo/1.0/direct?q=${inputValue}&limit=5&appid=${apiKey}`
    fetch(apiGeocodingURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.length > 0) {
                searchOutputEl.empty();
                for (let i = 0; i < data.length; ++i) {
                    const outputListEl = $('<div>');
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

function handleKeydown(event) {
    if (event.key === 'Enter') {
        const result = $('.search-result[num="0"]')
        return getWeatherData(result.text(), [result.attr("lat"), result.attr("lon")]);
    }
}

function handleClick() {
    const selectedEl = $(this);
    return getWeatherData(selectedEl.text(), [selectedEl.attr("lat"), selectedEl.attr("lon")]);
}

function showSearchHistory() {

    // empty out any previous history being displayed
    searchHistoryEl.empty();

    for (let i = 0; i < searchHistory.length; ++i) {
        const item = searchHistory[i];
        const searchHistoryItemEl = $('<div>');
        searchHistoryItemEl.text(item['city']);
        searchHistoryItemEl.addClass('search-history-item');
        searchHistoryItemEl.attr('num', i);
        searchHistoryItemEl.attr('lat', item['coordinates'][0]);
        searchHistoryItemEl.attr('lon', item['coordinates'][1]);
        searchHistoryEl.append(searchHistoryItemEl);
    }
}

function addSearchHistory(city, coordinates) {
    searchHistory.unshift({ city, coordinates});
    const maxSearchHistory = 5;
    searchHistory = searchHistory.slice(0, maxSearchHistory);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    return showSearchHistory();
}

function getWeatherData(city, coordinates) {
    searchOutputEl.empty();
    currentCityEl.empty();
    searchStringEl.val('');
    addSearchHistory(city, coordinates);
    const latSelect = coordinates[0];
    const lonSelect = coordinates[1];
    const apiWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latSelect}&lon=${lonSelect}&units=imperial&appid=${apiKey}`;
    fetch (apiWeatherURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);

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

searchStringEl.on("input", submitData)

searchOutputEl.on("click", ".search-result", handleClick)

searchHistoryEl.on("click", ".search-history-item", handleClick)

// checking if they pressed enter
searchStringEl.on("keydown", handleKeydown);

showSearchHistory();