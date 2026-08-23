// Simulates Scout, Worker, and Onlooker Agents
const predictBehavior = (data) => {
    let score = 0;
    // Scout Agent: Check for extreme outliers
    if (data.heartRate > 100 || data.heartRate < 50) score += 2;
    // Worker Agent: Check stress vs sleep ratio
    if (data.stress > 70 && data.sleep < 5) score += 2;
    // Onlooker Agent: Check breathing patterns
    if (data.breathe > 25) score += 1;

    return score >= 3 ? "Abnormal" : "Normal";
};

module.exports = { predictBehavior };