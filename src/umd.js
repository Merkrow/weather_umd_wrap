(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root.Requester = factory(root.jQuery);
    }
}(this, function (jQuery) {
    'use strict';
    let prev = 'k';
    const key = '224e0c3868331db50d9d7b56b3ab17ac';
    const tags = {
        body: null,
        search: null,
        temperature: null,
        metricTemperature: null,
        image: null,
        city: null,
        metricSelect: null,
        date: null,
        result: null
    }

    function run () {
        console.log(document);
        tags.body = document.body;
        renderHTML();
        tags.search = document.getElementsByClassName('searchTextField')[0];
        tags.temperature = document.getElementsByClassName('temp')[0];
        tags.metricTemperature = document.getElementsByClassName('metric_temp')[0];
        tags.image = document.getElementsByClassName('image')[0];
        tags.city = document.getElementsByClassName('city')[0];
        tags.metricSelect = document.getElementsByClassName('metric')[0];
        tags.date = document.getElementsByClassName('date')[0];
        tags.result = document.getElementsByClassName('result')[0];
        initialize();
        defaultCity();
        setCity(tags.search);
        changeMetric();
        metricTemp(prev);
    }

    function initialize() {
        const input = tags.search;
        var autocomplete = new google.maps.places.Autocomplete(input, { types: ['(cities)'], language: ['eu'] });
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            const place = autocomplete.getPlace().formatted_address.split(', ')[0];
            tags.search.value = place;
            getWeather(place);
        });
    }

    function renderHTML() {
        let text = `<div class="result">
                    <div class="search">
                        <input class="searchTextField" type="text" size="50" placeholder="Enter a location" autocomplete="on" autofocus>
                    </div>
                    <div class="main">
                        <div class="date"></div>
                        <div class="city"></div> 
                        <div class="weather_image"><img class='image' src='' alt=""></div>
                        <span class='wrap'><span class="temp"></span><span class="metric_temp"></span></span>
                        <select name="metric" class="metric">
                            <option value="k">Kelvin</option>
                            <option value="c">Celsius</option>
                            <option value="f">Fahrenheit</option>
                        </select>
                    </div>
                </div>`;
        tags.body.innerHTML = text;
    }

    function getWeather(city) {
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${key}`;
        return fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            render(data);
        });
    }

    function render(data) {
        const current = prev;
        let a = data.main.temp;
        let m;
        tags.city.innerHTML = data.name + ", " + data.sys.country;

        switch (current) {
            case 'k':
                a = Math.round(a);
                m = 'K';
                break;
            case 'c':
                a = Math.round(a - 273);
                m = '&deg;C';
                break;
            case 'f':
                a = Math.round((a - 273) *9/5 + 32);
                m = 'F';
                break;
        }

        tags.temperature.innerHTML = a;
        tags.metricTemperature.innerHTML = m;
        tags.image.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
        writeDate();
        currentBg(data);
        changeBgTemp(current);
    }

    function setCity(inp) {
        return  new Promise(resolve => {
            inp.addEventListener('keyup', function (e) {
                if ((e.keyCode == 13 && e.target.value)) {
                    resolve (getWeather(e.target.value.split(", ")[0]));
                }
            });
        });
    }

    function writeDate() {
        let d = new Date();
        const monthes = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        tags.date.innerHTML = monthes[d.getMonth()] + ", " + d.getDate();
    }

    function changeBgTemp() {
        let current = +tags.temperature.innerHTML;
        current = prev === 'k' ? current - 273 : prev === 'f' ? Math.round((current - 32) * 5/9) : current;
        let color = current < 5 ? '#44a5dd' : current > 25 ? '#f01a1a' : '#F5DB5C';
        tags.result.style.background = color;
    }

    function changeMetric() {
        tags.metricSelect.addEventListener("change", function() {
            const current = tags.metricSelect.value;
            metricRender(prev, current);
            prev = current;
            metricTemp(current);
        })
    }

    function metricTemp(prev) {
        const current = tags.metricTemperature;
        prev === 'k' ? current.innerHTML = 'K' : prev === 'c' ? current.innerHTML = '&deg;C' : current.innerHTML = 'F';
    }

    function currentBg(data) {
        const current = tags.body;
        let weather = data.weather[0].description;
        weather = weather !== 'cloudy' && weather !== 'sunny' && weather !== 'light rain' && weather !== 'mist' && weather !== 'broken clouds' ? 'snow' : weather;
        weather = weather === 'broken clouds' ? 'cloudy' : weather;
        weather = weather === 'clear sky' || weather === 'few clouds' || weather ===  'scattered clouds' ? 'sunny' : weather;
        weather = weather === 'mist' ? weather : weather;
        weather = weather === 'light rain' ? 'rainy' : weather;
        current.style.background = `url('img/${weather}.jpg')`;
    }

    function metricRender(prev, current) {
        let degree = +tags.temperature.innerHTML;
        switch(prev) {
            case 'k':
                degree = current === 'c' ? degree - 273 : Math.round((degree - 273) * 9/5 + 32);
                break;
            case 'c':
                degree = current === 'k' ? degree + 273 : Math.round(degree * 9/5 + 32);
                break;
            case 'f':
                degree = current === 'c' ? Math.round((degree - 32) * 5/9) : Math.round((degree - 32) * 5/9 + 273);
                break;
        }
        tags.temperature.innerHTML = degree;
    }

    function defaultCity() {
        fetch('http://ip-api.com/json').then(response => response.json()).then(data => getWeather(data.city));
    }

    return run();
}));