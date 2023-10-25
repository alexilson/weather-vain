const apiKey = "3f72ddeed10ffe4814723bf1b93c4536";
const searchStringEl = $('#search-string')
const searchOutputEl = $('#search-output')

function submitData() {
    inputValue = searchStringEl.val();
    console.log(searchStringEl.val())
    if (inputValue.length < 3) {
        return;
    }
    const apiGeocodingURL = `http://api.openweathermap.org/geo/1.0/direct?q=${inputValue}&limit=5&appid=${apiKey}`
    console.log(apiGeocodingURL);
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
                        console.log(data[i].name + ", " + data[i].state + ", " + data[i].country);
                        outputListEl.text(data[i].name + ", " + data[i].state + ", " + data[i].country + "\nLongitude: " + data[i].lon + "\nLatitude: " + data[i].lat);
                    }
                    else {
                        console.log(data[i].name + ", " + data[i].country);
                        outputListEl.text(data[i].name + ", " + data[i].country + "\nLongitude: " + data[i].lon + "\nLatitude: " + data[i].lat);
                    }
                    const apiWeatherURL = `api.openweathermap.org/data/2.5/forecast?lat=${data[i].lat}&lon=${data[i].lon}&appid=${apiKey}`;
                    console.log(apiWeatherURL);
                    searchOutputEl.append(outputListEl);
                }
            }

        });
}

searchStringEl.on("input", submitData)

// https://api.openweathermap.org/data/2.5/forecast?q=portland&units=imperial&appid=3f72ddeed10ffe4814723bf1b93c4536
