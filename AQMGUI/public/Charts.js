// Author: Preston Lisek
import { createChart, getGradient, setPMChartDatasetFromArray, setSDSDataArrayFromFile, setAQIChartFromArray, setLiveViewFromArray } from './chartHelper.js';

const ctxPM = document.getElementById('pmChart');
const ctxAQI = document.getElementById('AQIChart');
const tablinks = document.getElementsByClassName("tablinks");
const liveViews = document.getElementsByClassName("liveView");

const SDS_Data_File = './data/SDS011DATA.csv';

let currentDataSet = sessionStorage.getItem('currentTab');

let delayed;

let PM_Chart;
let AQI_Chart;

const PM_Chart_Config = {
    type: 'line',

    data: {
        labels: ['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'],

        datasets: [{
            label: 'PM2.5 ',
            data: [],
            spanGaps: true,
        }
        ]
    },

    options: {
        layout: {
            padding: {
                top: 20,
                left: 10,
                bottom: 10
            }
        },

        interaction: {
            intersect: false,
            axis: 'x',
            mode: 'nearest'
        },

        scales: {
            x: {
                offset: true,

                border: {
                    display: false,
                },

                grid: {
                    display: false,
                },

                ticks: {
                    source: 'labels',
                    autoSkip: true,
                    maxRotation: 0,
                    maxTicksLimit: 6,
                }
            },
            y: {
                min: 0,
                max: 150,
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    autoSkip: false,

                    callback: function (value, index, values) {
                        return [12, 35, 55, 100, 150].includes(value) ? value : '';
                    }
                },

                border: {
                    color: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (chartArea) {
                            return getGradient(ctx, chartArea);
                        }
                    },
                    width: 5
                },

                grid: {
                    display: false,
                },
            }
        },

        elements: {
            point: {
                backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (chartArea) {
                        return getGradient(ctx, chartArea);
                    }
                },
                borderColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (chartArea) {
                        return getGradient(ctx, chartArea);
                    }
                },
                pointHoverRadius: 0,
                pointRadius: 0,
            },
            line: {
                tension: 0.1,
                borderColor: 'rgba(255, 255, 255, 0.75)',
            }
        },

        animation: {
            animation: sessionStorage.getItem('showAnimation') === 'true',

            onComplete: (context) => {
                delayed = true;
                sessionStorage.setItem('showAnimation', false);
            },

            delay: (context) => {
                let delay = 0;
                if (context.type === 'data' && context.mode === 'default' && !delayed) {
                    delay = context.dataIndex * 150 + context.datasetIndex * 75;
                }

                return delay;
            },
        },
        plugins: {
            2: false,
            tooltip: {
                displayColors: true,
                usePointStyle: true,
                boxPadding: 3,
                callbacks: {
                    beforeBody: function (context) {
                        let label = context[0].dataset.label || '';

                        if (label) {
                            label += ': ';

                        }

                        return label + context[0].raw + "\u03BCg/m\u00B3";
                    },
                    label: function (context) {
                        let value = context.parsed.y || '';
                        switch (true) {
                            case value >= 0 && value <= 12:
                                return 'Good';
                            case value >= 13 && value <= 35:
                                return 'Moderate';
                            case value >= 36 && value <= 55:
                                return 'Unhealthy';
                            case value >= 56:
                                return 'Poor';
                            default:
                                return 'Invalid input';
                        }
                    }
                }
            },
            legend: {
                display: false
            }
        }
    }
};

const AQI_Chart_Config = {
    type: 'pie',
    data: {
        labels: ['PM2.5'],
        datasets: [
            {
                cutout: '88%',
                data: [0],
                backgroundColor: (context) => {
                    const currentValue = context.dataset.data[context.dataIndex];
                    return context.dataIndex === 0 ? getColorBasedOnRange(currentValue) : 'rgba(255, 255, 255, 0.75)';
                },
                borderWidth: [
                    0, 0
                ],
                borderRadius: [
                    0, 0
                ]
            }]
    },
    options: {
        hover: { mode: null },

        animation: {
            // animation: sessionStorage.getItem('showAnimation') === 'true',

            onComplete: () => {
                sessionStorage.setItem('showAnimation', false);
            },
        },

        interaction: {
            intersect: false,
            axis: 'x',
            mode: 'nearest'
        },
        plugins: {
            1: false,

            tooltip: {
                enabled: false,
            },

            legend: {
                display: false,
            },
        }
    },
};

function changeDataSet(evt, index) {
    sessionStorage.setItem('currentTab', index);
    currentDataSet = index;

    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    setPMChartDatasetFromArray(PM_Chart, index, 'none');


    evt.currentTarget.className += " active";
}

function getColorBasedOnRange(value) {
    switch (true) {
        case (value >= 0 && value <= 50):
            return '#4caf50';
        case (value >= 51 && value <= 100):
            return 'yellow';
        case (value >= 101 && value <= 150):
            return 'orange';
        case (value >= 151):
            return 'red';
        default:
            return 'Invalid input';
    }
}

//Add event listeners to tab buttons
Array.from(tablinks).forEach(function (tablink, index) {
    tablink.addEventListener("click", function (event) {
        changeDataSet(event, index);
    });
});

//Set current tab to active on initial page load
tablinks[currentDataSet].className = tablinks[currentDataSet].className += " active";

//Load data from file into array on initial page load
await setSDSDataArrayFromFile(SDS_Data_File);

//Initialize PM Chart and set data
PM_Chart = createChart(ctxPM, PM_Chart_Config);
setPMChartDatasetFromArray(PM_Chart, currentDataSet, '');

//Initialize AQI Chart and set data
AQI_Chart = createChart(ctxAQI, AQI_Chart_Config);
setAQIChartFromArray(AQI_Chart);

setLiveViewFromArray(liveViews)

//Load file (to get new data) and set chart data every minute
setInterval(async () => {
    await setSDSDataArrayFromFile(SDS_Data_File);

    setPMChartDatasetFromArray(PM_Chart, currentDataSet, 'none');
    setAQIChartFromArray(AQI_Chart);
    setLiveViewFromArray(liveViews)
}, 30000);
