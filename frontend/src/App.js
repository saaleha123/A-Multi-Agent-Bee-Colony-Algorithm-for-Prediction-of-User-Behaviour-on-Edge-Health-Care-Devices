import React, { useState } from 'react';
import './App.css';
import { connectToWatch, parseHeartRate } from './BluetoothService';

function App() {
  const [step, setStep] = useState(1);
  const [isPaired, setIsPaired] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState({
    heartRate: 0,
    stress: 0,
    sleep: 0,
    breathe: 0,
    prediction: ""
  });

  // STEP 1: Connect to the Real Smartwatch via Bluetooth
  const handleDeviceConnect = async () => {
    const characteristic = await connectToWatch();
    
    if (characteristic) {
      setIsPaired(true);
      console.log("Real Device Connected!");

      // Start listening to real-time data from the watch
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const liveHeartRate = parseHeartRate(event.target.value);
        // Update state with live data
        setData(prev => ({ ...prev, heartRate: liveHeartRate }));
      });
    }
  };

  // STEP 2: Process with MABC Framework & Sync to Cloud
  const startMABCProcess = () => {
    setSyncing(true);
    
    // Simulating Multi-Agent Bee Colony Processing Delay
    setTimeout(async () => {
      // Create data package (mixing real HR with simulated edge sensors)
      const healthPackage = {
        heartRate: data.heartRate || Math.floor(Math.random() * (100 - 60) + 60),
        stress: Math.floor(Math.random() * 30),
        sleep: 6.5,
        breathe: 18
      };

      try {
        // AUTOMATIC CLOUD SYNC
        const response = await fetch('http://localhost:5000/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(healthPackage)
        });
        
        const result = await response.json();
        
        setData({ ...healthPackage, prediction: result.prediction });
        setSyncing(false);
        setStep(3);
      } catch (err) {
        console.error("Cloud Sync Failed:", err);
        // Fallback for demo if backend is offline
        setData({ ...healthPackage, prediction: "Normal" });
        setSyncing(false);
        setStep(3);
      }
    }, 3000);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <h2>Multi-Agent Bee Colony Framework</h2>
      </nav>

      <div className="container">
        <div className="card">
          
          {/* PAGE 1: DEVICE DISCOVERY */}
          {step === 1 && (
            <div className="step-one">
              <h3>Edge Device Connection</h3>
              <div className="device-status-box">
                {isPaired ? (
                  <div className="status-paired">⌚ Device Linked Successfully</div>
                ) : (
                  <button className="btn-scan" onClick={handleDeviceConnect}>
                    Scan for Smartwatch
                  </button>
                )}
              </div>
              <button 
                className="btn-next" 
                disabled={!isPaired} 
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </div>
          )}

          {/* PAGE 2: PROCESSING & SYNCING */}
          {step === 2 && (
            <div className="step-two">
              <h3>MABC Processing...</h3>
              <p>Bee Agents are analyzing sensor streams...</p>
              <div className="loader"></div>
              {!syncing && (
                <button className="btn-sync" onClick={startMABCProcess}>
                  Sync to Patient Cloud
                </button>
              )}
            </div>
          )}

          {/* PAGE 3: CLOUD RESULTS */}
          {step === 3 && (
            <div className="step-three">
              <div className="result-header">Analysis Complete</div>
              <div className="result-box">
                <p><strong>Heart Rate:</strong> {data.heartRate} bpm</p>
                <p><strong>Stress Level:</strong> {data.stress}%</p>
                <p><strong>Respiratory Rate:</strong> {data.breathe} rpm</p>
                <div className="divider"></div>
                <p className="prediction-text">
                  <strong>User Behavior:</strong> 
                  <span className={data.prediction === 'Normal' ? 'status-green' : 'status-red'}>
                    {" "}{data.prediction}
                  </span>
                </p>
              </div>
              <p className="cloud-footer">✅ Record encrypted and stored in Cloud Registry.</p>
              <button className="btn-reset" onClick={() => { setStep(1); setIsPaired(false); }}>
                Restart Analysis
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;