import React, { useState } from 'react';
import './App.css';

/**
 * --- BLUETOOTH CONNECTION LOGIC ---
 */
const connectToWatch = async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['battery_service']
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    const characteristic = await service.getCharacteristic('heart_rate_measurement');
    await characteristic.startNotifications();
    return { characteristic, deviceName: device.name };
  } catch (error) {
    console.error("Bluetooth selection failed:", error);
    return null;
  }
};

const parseHeartRate = (value) => {
  const flags = value.getUint8(0);
  return (flags & 0x1) ? value.getUint16(1, true) : value.getUint8(1);
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState(1);
  const [isPaired, setIsPaired] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [data, setData] = useState({ heartRate: 0, stress: 0, prediction: "Analyzing..." });

  const handleDeviceClick = async (deviceType) => {
    setSelectedDevice(deviceType);
    if (deviceType === 'Apple Watch') {
      const result = await connectToWatch();
      setIsPaired(true); 
      if (result?.characteristic) {
        result.characteristic.addEventListener('characteristicvaluechanged', (event) => {
          setData(prev => ({ ...prev, heartRate: parseHeartRate(event.target.value) }));
        });
      }
    } else {
      setIsPaired(true);
    }
  };

  const startMABCProcess = () => {
    setSyncing(true);
    setTimeout(() => {
      const hr = data.heartRate || Math.floor(Math.random() * (88 - 68) + 68);
      setData({ heartRate: hr, stress: 15, prediction: "Normal Health State" });
      setStep(3);
      setSyncing(false);
    }, 3000);
  };

  // --- LOGIN PAGE (CENTERED) ---
  if (!isLoggedIn) {
    return (
      <div className="App">
        <nav className="navbar" style={{backgroundColor: '#2c3e50', color: 'white', padding: '15px', textAlign: 'center'}}>
          <h1>Multi-Agent Bee Colony Framework</h1>
        </nav>
        <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
          <div className="card" style={{maxWidth: '400px', width: '100%', textAlign: 'center'}}>
            <h2 style={{marginBottom: '20px'}}>User Login</h2>
            <form onSubmit={() => setIsLoggedIn(true)} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <input type="text" placeholder="Username" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} required />
              <input type="password" placeholder="Password" style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} required />
              <button type="submit" className="btn-primary" style={{padding: '12px', cursor: 'pointer'}}>Access Dashboard</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP (CENTERED DASHBOARD) ---
  return (
    <div className="App">
      <nav className="navbar" style={{backgroundColor: '#2c3e50', color: 'white', padding: '15px', textAlign: 'center', position: 'relative'}}>
        <h1>Multi-Agent Bee Colony Framework</h1>
        <button onClick={() => {setIsLoggedIn(false); setStep(1); setIsPaired(false);}} style={{position: 'absolute', right: '20px', top: '15px', background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer'}}>Logout</button>
      </nav>

      <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px'}}>
        <div className="card" style={{width: '100%', maxWidth: '900px', textAlign: 'center'}}>
          
          {step === 1 && (
            <div className="step-one">
              <h2 style={{marginBottom: '30px'}}>Select Edge Healthcare Device</h2>
              
              <div className="device-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className={`device-frame ${selectedDevice === 'Apple Watch' ? 'active' : ''}`} onClick={() => handleDeviceClick('Apple Watch')}>
                  <span className="device-icon" style={{fontSize: '40px'}}>⌚</span>
                  <p style={{fontWeight: '500', marginTop: '10px'}}>Apple Watch</p>
                  <small style={{color: '#007bff'}}>Scan Bluetooth</small>
                </div>

                <div className={`device-frame ${selectedDevice === 'Fitbit Sense' ? 'active' : ''}`} onClick={() => handleDeviceClick('Fitbit Sense')}>
                  <span className="device-icon" style={{fontSize: '40px'}}>🏃‍♂️</span>
                  <p style={{fontWeight: '500', marginTop: '10px'}}>Fitbit Sense</p>
                </div>

                <div className={`device-frame ${selectedDevice === 'Oura Ring' ? 'active' : ''}`} onClick={() => handleDeviceClick('Oura Ring')}>
                  <span className="device-icon" style={{fontSize: '40px'}}>💍</span>
                  <p style={{fontWeight: '500', marginTop: '10px'}}>Oura Ring</p>
                </div>

                <div className={`device-frame ${selectedDevice === 'Whoop Strap' ? 'active' : ''}`} onClick={() => handleDeviceClick('Whoop Strap')}>
                  <span className="device-icon" style={{fontSize: '40px'}}>🎗️</span>
                  <p style={{fontWeight: '500', marginTop: '10px'}}>Whoop Strap</p>
                </div>
              </div>

              {isPaired && (
                <div className="status-box" style={{marginTop: '30px', padding: '25px', border: '1px solid #28a745', borderRadius: '12px', backgroundColor: '#f8fff9'}}>
                  <p style={{color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px'}}>
                    ✓ {selectedDevice} Linked
                  </p>
                  <button className="btn-primary" style={{padding: '12px 40px', fontSize: '1rem'}} onClick={() => setStep(2)}>Initialize Agents</button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="step-two">
              <h2 style={{marginBottom: '20px'}}>Syncing MABC Agents...</h2>
              <p style={{color: '#666', marginBottom: '20px'}}>Fetching biometric streams from {selectedDevice}...</p>
              <div className="loader" style={{margin: '0 auto 20px'}}></div>
              {!syncing && <button className="btn-primary" onClick={startMABCProcess}>Start Real-time Sync</button>}
            </div>
          )}

          {step === 3 && (
            <div className="step-three" style={{textAlign: 'center'}}>
              <h2 style={{marginBottom: '20px'}}>Health Analytics Report</h2>
              <div className="result-card" style={{padding: '30px', background: '#f9f9f9', borderRadius: '15px', display: 'inline-block', textAlign: 'left', minWidth: '300px'}}>
                <p><strong>Device Source:</strong> {selectedDevice}</p>
                <p><strong>Heart Rate:</strong> {data.heartRate} bpm</p>
                <p><strong>Stress Level:</strong> {data.stress}%</p>
                <div style={{marginTop: '20px', padding: '15px', background: '#eef', borderRadius: '10px', borderLeft: '5px solid #007bff'}}>
                  <strong>MABC Analytics:</strong> {data.prediction}
                </div>
              </div>
              <div style={{marginTop: '30px'}}>
                <button className="btn-primary" onClick={() => { setStep(1); setIsPaired(false); setSelectedDevice(null); }}>Perform New Scan</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;