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
                        outputListEl.text(data[i].name + ", " + data[i].state + ", " + data[i].country);
                    }
                    else {
                        outputListEl.text(data[i].name + ", " + data[i].country);
                    }
                    outputListEl.addClass('search-result')
                    outputListEl.attr('lon', data[i].lon);
                    outputListEl.attr('lat', data[i].lat);
                    searchOutputEl.append(outputListEl);
                }
            }

        });
}

searchStringEl.on("input", submitData)

searchOutputEl.on("click", ".search-result", function() {
    searchOutputEl.empty();
    const selectedEl = $(this);
    const latSelect = selectedEl.attr("lat");
    const lonSelect = selectedEl.attr("lon");
    const apiWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latSelect}&lon=${lonSelect}&units=imperial&appid=${apiKey}`;
    fetch (apiWeatherURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data.list[0].main.temp);
        })
})
