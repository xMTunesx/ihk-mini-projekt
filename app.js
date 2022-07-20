require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const https = require('https');
const wget = require('node-wget');
const { con } = require('./db');
const json = require('./weather.json');
const PORT = process.env.PORT || 5001;
const app = express();

/** /////////////////////////////////////////////////////////////////// */
wget({
    url: 'https://api.openweathermap.org/data/2.5/weather?q=Hamburg&appid=a47876391a9f83964687ec1dd1052d69',
    dest: '/Users/xmtunesx/Downloads/ccpk/node_xpr/',
    timeout: 2000
},
    (err) => err ? console.log(err) : console.log('Downloaded JSON-File'));
/** /////////////////////////////////////////////////////////////////// */

/** //////////////////////// * DatenBank * //////////////////////// */

//** Drop Tables */
// con.query({ sql: 'drop table weather' }, (err) => err ?
//     console.log(err) :
//     console.log('Drop tables'));

//* Create Tables
let createWeather = `CREATE TABLE IF NOT EXISTS weather(
    cityName VARCHAR(255) NOT NULL,
    temp    float NOT NULL,
    feel    float NOT NULL,
    wdesc   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)`;
//* Save our Tables
con.query(createWeather, (err) => err ?
    console.log(err) :
    console.log('Added tables'));

/** /////////////////////////////////////////////////////////////////// */


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`));

app.post('/', (req, res) => {
    let search = req.body.cityName;
    const apiKey = 'a47876391a9f83964687ec1dd1052d69';
    const unit = 'metric';

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${apiKey}&units=${unit}`;
    const offline_json = json;

    https.get(url, (response) => {

        response.on('data', (data) => {
            const weatherData = JSON.parse(data);
            const temp = !weatherData.main ? offline_json.main.temp : weatherData.main.temp;
            const feel = !weatherData.main ? offline_json.main.feels_like : weatherData.main.feels_like;
            const wdesc = !weatherData.weather ? offline_json.weather[0].description : weatherData.weather[0].description;
            const icon = !weatherData.weather ? offline_json.weather[0].icon : weatherData.weather[0].icon;
            const urlIMG = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            const lat = !weatherData.coord ? offline_json.coord.lat : weatherData.coord.lat;
            const lon = !weatherData.coord ? offline_json.coord.lon : weatherData.coord.lon;

            //* Gmaps //
            const APIKEY = 'AIzaSyAYHyQ2eIb8M1oMN_S0Z7Hkve6h2UkFBi0';
            const PARAM = `q=${lat},${lon}`;
            const src = `https://www.google.com/maps/embed/v1/place?key=${APIKEY}&${PARAM}`;

            //% Insert SQL //
            const sql = `INSERT INTO weather (cityName, temp, feel, wdesc) VALUES ('${search}', '${temp}', '${feel}', '${wdesc}')`;
            con.query(sql, (err, result) => err ? console.error('err: ', err.message) : '');

            res.write(`<h1> ${search} </h1>`);
            res.write(`<h1> Tempeture is ${temp} C </h1>`);
            res.write(`<h1> Feels like ${feel} C </h1>`);
            res.write(`<img src="${urlIMG}" alt="icon"/>`);
            res.write(`<p> ${wdesc} </p>`);
            res.write('<br/>');
            res.write(`<iframe src="${src}"width="450" height="250"frameborder="0" style="border:0"referrerpolicy="no-referrer-when-downgrade">' + '</iframe>`);
            res.write(`<h1> ${lat} Lat ${lon} Lon </h1>`);
            res.send();
        });
    });
});



app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));