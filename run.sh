#!/bin/bash
echo "Starting AQM..."

cd /home/preston-lisek/Desktop/AirQualityMonitor/AQMGUI

# Start AQMGUI program
./AQMGUI.AppImage &



echo "Starting Python app..."

cd /home/preston-lisek/Desktop/AirQualityMonitor/SDS011/src

# Start sds011 sensor program
python sds011.py &



echo "Starting C app..."


cd /home/preston-lisek/Desktop/AirQualityMonitor/BME280/src

# Start bme280 sensor program
./bme280 /dev/i2c-1 &

wait

echo "Both apps started successfully."
