const apiKey = "3f72ddeed10ffe4814723bf1b93c4536";
const searchStringEl = $('#search-string');
const searchOutputEl = $('#search-output');

function convertDate(utcDate) {
    return new Date(utcDate * 1000).toLocaleString()
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
        return getWeatherData([result.attr("lat"), result.attr("lon")]);
    }
}

function handleClick() {
    const selectedEl = $(this);
    return getWeatherData([selectedEl.attr("lat"), selectedEl.attr("lon")]);
}

function getWeatherData(coordinates) {
    searchOutputEl.empty();
    const latSelect = coordinates[0];
    const lonSelect = coordinates[1];
    const apiWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latSelect}&lon=${lonSelect}&units=imperial&appid=${apiKey}`;
    fetch (apiWeatherURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data)
            console.log(data.list[0].main.temp);
            // console.log(new Date(data.list[0].dt * 1000).toLocaleString());
            console.log(convertDate(data.list[0].dt));
            console.log(data.city.name)
            console.log(data.list[7].main.temp);
            console.log(convertDate(data.list[8].dt));
            console.log(data.list[15].main.temp);
            console.log(convertDate(data.list[16].dt));
            console.log(data.list[23].main.temp);
            console.log(convertDate(data.list[24].dt));
        })
}

searchStringEl.on("input", submitData)

searchOutputEl.on("click", ".search-result", handleClick)

// checking if they pressed enter
searchStringEl.on("keydown", handleKeydown);
