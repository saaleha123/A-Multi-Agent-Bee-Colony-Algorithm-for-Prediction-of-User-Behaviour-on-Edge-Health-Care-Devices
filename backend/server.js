const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock Cloud Database
let cloudStorage = [];

app.post('/predict', (req, res) => {
    const { fitness, heartRate, breathe, stress, sleep } = req.body;

    // Simulation of Multi-Agent Bee Colony Logic
    // 1. Scout Agent: Detects data anomalies
    // 2. Worker Agent: Processes fitness/heart-rate ratio
    // 3. Onlooker Agent: Final probability check
    
    let status = "Normal";
    let alertLevel = 0;

    if (heartRate > 100 || heartRate < 50) alertLevel++;
    if (stress > 80) alertLevel++;
    if (breathe > 20) alertLevel++;

    // Decision Logic
    if (alertLevel >= 2) {
        status = "Abnormal";
    }

    const predictionResult = {
        status,
        timestamp: new Date().toISOString(),
        agentValidation: "MABC-Verified",
        id: Math.random().toString(36).substr(2, 9)
    };

    // Store in "Cloud"
    cloudStorage.push({ user: 'Patient_01', ...req.body, ...predictionResult });
    console.log("Cloud Updated:", cloudStorage.length, "records.");

    res.json(predictionResult);
});

app.listen(5000, () => console.log('MABC Backend running on port 5000'));