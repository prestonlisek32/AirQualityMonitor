// Author: Preston Lisek
Chart.defaults.color = '#FFFFFF';
Chart.defaults.font.family = 'Courier New';
Chart.defaults.font.size = 14

// Initialize arrays to store data for each header column
const SDSData = [[], [], []];

if (sessionStorage.getItem("showAnimation") === null)
    sessionStorage.setItem("showAnimation", true);

if (sessionStorage.getItem("currentTab") === null)
    sessionStorage.setItem("currentTab", 0);

export function createChart(domElementCtx, config) {
    let chart = new Chart(domElementCtx, config);
    return chart;
}

export function getGradient(ctx, chartArea) {
    let width, height, gradient;

    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

        gradient.addColorStop(0.0, "green");
        gradient.addColorStop(0.13, "yellow");
        gradient.addColorStop(0.36, "orange");
        gradient.addColorStop(0.56, "red");

    }

    return gradient;
};

export function setLiveViewFromArray(elements) {
    Array.from(elements).forEach(function (element, index) {
        element.textContent = SDSData[index][24]
    });
}

export function setAQIChartFromArray(chart, datasetIndex = 2) {
    const maxValue = 500;  //Max AQI value

    const data = SDSData[2][24]; //Current AQI value reading from sensor stored in idx 23

    //Will show a percentage of the max value
    chart.data.datasets[0].data[0] = data;
    chart.data.datasets[0].data[1] = maxValue - data;

    chart.update();

    console.log("updated AQI Chart");
}

export async function parseBMESensorData(filePath) {
    const sensorData = await requestData(filePath);
    const parsedData = sensorData.split(",");

    return parsedData;
}

export function setPMChartDatasetFromArray(chart, datasetIndex, test) {
    const label = SDSData[datasetIndex][SDSData[datasetIndex].length - 1];

    chart.data.datasets[0].label = label;
    chart.data.datasets[0].data = SDSData[datasetIndex];

    chart.update(test);

    console.log("updated PM Chart");
}

export async function setSDSDataArrayFromFile(filePath) {
    const data = await requestData(filePath);
    csvToArray(data);
}

function csvToArray(dataString) {
    let lines = dataString.split('\n');
    let headers = lines[0].split(',');

    // Process each line starting from the second line (index 1)
    for (let i = 1; i < lines.length - 1; i++) {
        let values = lines[i].split(',');

        // Assign the values to their respective arrays, converting "null" to null
        SDSData[0][i - 1] = values[1] === 'null' ? null : parseFloat(values[1]);
        SDSData[1][i - 1] = values[2] === 'null' ? null : parseFloat(values[2]);
        SDSData[2][i - 1] = values[3] === 'null' ? null : parseFloat(values[3]);
    }

    for (let i = 1; i < headers.length - 1; i++) {
        if (SDSData[i - 1][25] == null)
            SDSData[i - 1][25] = headers[i];
    }
}

async function requestData(filePath) {
    const res = await window.general.readDataFile(filePath);
    return res;
}

Chart.register({
    id: '1',
    beforeDraw: (chart) => {
        if (chart.getActiveElements().length) {
            const activePoint = chart.getActiveElements()[0];
            const chartArea = chart.chartArea;
            const ctx = chart.ctx;

            ctx.save();

            ctx.beginPath();

            ctx.moveTo(activePoint.element.x, activePoint.element.y);
            ctx.lineTo(activePoint.element.x, chartArea.bottom);

            ctx.setLineDash([2, 2]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.restore();
        }
    },
});

Chart.register({
    id: '2',
    afterDatasetDraw: (chart, args, options) => {
        const { ctx, data } = chart;
        const text = data.datasets[0].data[0];

        ctx.save();

        const meta = chart.getDatasetMeta(0);
        const x = meta.data[0].x;
        const y = meta.data[0].y;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 64px Courier';

        // Draw the main text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, x, y);

        // Draw a smaller text below the main text
        const smallerText = 'AQI';
        ctx.font = '20px Courier';

        // Set color based on the value of text
        const textColor = text <= 50 ? '#4caf50' : text <= 100 ? 'yellow' : text <= 150 ? 'orange' : 'red';
        ctx.fillStyle = textColor;

        ctx.fillText(smallerText, x, y + 40); // Adjust the vertical position as needed

        ctx.restore();
    }
});