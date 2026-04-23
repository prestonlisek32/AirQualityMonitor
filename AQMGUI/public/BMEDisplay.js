//Author : Preston Lisek
import { parseBMESensorData } from './chartHelper.js';

let isCelsius = true;
let isAnimating = false;
let curTemperature;

const BME280_Data_File = './data/BME280DATA.csv';

const sensorDivs = document.querySelectorAll(".sensor");

const temperatureElement = document.getElementById("temperature");
const temperatureUnitElement = document.getElementById("temperature-unit");

const section = document.getElementById("toggle");
section.addEventListener("click", toggleTemperature);

async function updateSensorReadings() {
    const parsedBMEData = await parseBMESensorData(BME280_Data_File);

    curTemperature = parsedBMEData[0];
    setTemperatureAndUnit(isCelsius)

    sensorDivs[1].textContent = Math.round(parsedBMEData[1]);
    sensorDivs[2].textContent = Math.round(parsedBMEData[2]);

    console.log("updated BME280 data display");
}

function toggleTemperature() {
    if (isAnimating) return;

    section.classList.add("disabled");

    isAnimating = true;

    temperatureElement.style.opacity = "0";
    temperatureUnitElement.style.opacity = "0";

    setTimeout(() => {
        isCelsius = !isCelsius;

        setTemperatureAndUnit(isCelsius);

        temperatureElement.style.opacity = "1";
        temperatureUnitElement.style.opacity = "1";

        setTimeout(() => {
            section.classList.remove("disabled");
            isAnimating = false;
        }, 300); // Wait for an additional 300 milliseconds before enabling the button
    }, 800); // Wait for the fade-out animation (0.8s) to complete before updating content and fade-in
}

function setTemperatureAndUnit(isCelsius) {
    let curCelcius = curTemperature;
    let curFarnehit = (curTemperature * 9) / 5 + 32;

    if (isCelsius) {
        temperatureElement.textContent = Math.round(curCelcius); // Include the degree symbol
        temperatureUnitElement.textContent = "°C";
    } else {
        temperatureElement.textContent = Math.round(curFarnehit); // Include the degree symbol
        temperatureUnitElement.textContent = "°F";
    }
}

updateSensorReadings();

// will update display every 10 seconds from file;
setInterval(updateSensorReadings, 10000);
