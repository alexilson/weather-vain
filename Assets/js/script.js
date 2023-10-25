const apiKey = "3f72ddeed10ffe4814723bf1b93c4536";
const searchStringEl = $('#search-string')
const outputEl = $('#output')

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
                outputEl.empty();
                for (let i = 0; i < data.length; ++i) {
                    const outputListEl = $('<li>');
                    if (data[i].state) {
                        console.log(data[i].name + ", " + data[i].state + ", " + data[i].country);
                        outputListEl.text(data[i].name + ", " + data[i].state + ", " + data[i].country);
                    }
                    else {
                        console.log(data[i].name + ", " + data[i].country);
                        outputListEl.text(data[i].name + ", " + data[i].country);
                    }
                    outputEl.append(outputListEl);
                }
            }

        });
}

searchStringEl.on("input", submitData)

// https://api.openweathermap.org/data/2.5/forecast?q=portland&units=imperial&appid=3f72ddeed10ffe4814723bf1b93c4536
