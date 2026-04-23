##Author : Preston Lisek
import os
import datetime
import serial
import aqi

class SDS011():

    def __init__(self):
        self.ser = serial.Serial('/dev/ttyUSB0')

    def get_measurement(self):
        self.data = []
        for index in range(0,10):
            datum = self.ser.read()
            self.data.append(datum)
            
        self.pmtwo = int.from_bytes(b''.join(self.data[2:4]), byteorder='little') / 10
        self.pmten = int.from_bytes(b''.join(self.data[4:6]), byteorder='little') / 10
        
        myaqi = aqi.to_aqi([(aqi.POLLUTANT_PM25, str(self.pmtwo)),
                            (aqi.POLLUTANT_PM10, str(self.pmten))])
        
        self.aqi = float(myaqi)
     
        return {
            "timestamp": datetime.datetime.now(),
            "pm2.5": self.pmtwo,
            "pm10": self.pmten,
            "aqi": self.aqi,
        }

def update_csv_file(filename, timestamp_to_update, new_pm25, new_pm10, new_aqi):
    nullFile = False;
    
    try:
        with open(filename, 'r') as file:
            lines = file.readlines()

        with open('temp.csv', 'w') as temp_file:
            for line in lines:
                timestamp, pm25_value, pm10_value, aqi_value = line.strip().split(',')
                
                if (timestamp == "0" and timestamp_to_update == "0") and any(row.startswith('23,') and not row.startswith('23,null') for row in lines):
                    print("Timestamp 23 has a non-null pm25 value when updating timestamp 0. Resetting File...")
                    nullFile = True
                
                # Check if the current line matches the timestamp you want to update
                if nullFile:
                    #still write the data to 0
                    if timestamp == timestamp_to_update or timestamp == "24": 
                        temp_file.write(f"{timestamp},{new_pm25},{new_pm10},{new_aqi}\n")
                    else:
                        temp_file.write(f"{timestamp},null,null,null\n")
                else:
                    if timestamp == timestamp_to_update or timestamp == "24":
                        temp_file.write(f"{timestamp},{new_pm25},{new_pm10},{new_aqi}\n")
                    else:
                        temp_file.write(f"{timestamp},{pm25_value},{pm10_value},{aqi_value}\n")       

        # Rename the temporary file to the original file, prevents data loss 
        os.rename('temp.csv', filename)

        print("Update successful")

    except FileNotFoundError:
        print("Error opening file")
        exit(1)
    except Exception as e:
        print(f"Error: {e}")
        exit(1)


def main(): 
    filename = "../../AQMGUI/data/SDS011DATA.csv"
    
    SDS = SDS011()
    
    while(1):
    
        sensorData = SDS.get_measurement()
    
        tempHour = sensorData['timestamp'].hour
        timestamp_to_update = f"{tempHour}"
    
        new_pm25 = sensorData['pm2.5']
        new_pm10 = sensorData['pm10']
        new_aqi = sensorData['aqi']
        print(new_pm25, new_pm10, new_aqi) 
    
        update_csv_file(filename, timestamp_to_update, new_pm25, new_pm10,new_aqi)

if __name__ == "__main__":
    main()
   
