/**
 * BluetoothService.js
 * Handles the Web Bluetooth API connection to the Edge Device (Smartwatch)
 */

export const connectToWatch = async () => {
  try {
    console.log("Requesting Bluetooth Device...");

    // 1. Request the device
    // We filter for 'heart_rate' which is the standard BLE service for health devices
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['heart_rate'] }
      ],
      optionalServices: ['battery_service', 'device_information']
    });

    console.log("Device selected:", device.name);

    // 2. Connect to the GATT Server
    const server = await device.gatt.connect();
    console.log("Connected to GATT Server");

    // 3. Get the Heart Rate Service
    const service = await server.getPrimaryService('heart_rate');
    
    // 4. Get the Heart Rate Measurement Characteristic
    const characteristic = await service.getCharacteristic('heart_rate_measurement');

    // 5. Start Notifications (This allows the watch to send data automatically)
    await characteristic.startNotifications();

    console.log("Notifications started. Real-time data link established.");

    // Return the characteristic so App.js can listen to the data
    return characteristic;

  } catch (error) {
    console.error("Bluetooth Connection Error:", error);
    
    // If user cancels the popup, or Bluetooth is off
    if (error.name === 'NotFoundError') {
      alert("No device selected or Bluetooth is disabled.");
    } else if (error.name === 'SecurityError') {
      alert("Bluetooth requires a secure (HTTPS or localhost) connection.");
    }
    
    return null;
  }
};

/**
 * Helper to parse the raw data from the watch
 * BLE Heart Rate data is sent in a specific byte format
 */
export const parseHeartRate = (value) => {
  // The first byte is the flags, the second byte is the heart rate
  const heartRate = value.getUint8(1);
  return heartRate;
};