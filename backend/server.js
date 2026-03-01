const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/command/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const { action } = req.body;
    // Push a silent notification to the target device via APNs
    sendSilentPush(deviceId, { "action": action });
    res.send(`TIM: Command ${action} sent to device ${deviceId}`);
});

function sendSilentPush(deviceId, payload) {
    // TODO: Implement APNs push notification logic here
    console.log(`[APNs Stub] Sending silent push to ${deviceId} with payload:`, payload);
}

app.listen(3000, () => console.log('TIM Command Center running on port 3000'));
