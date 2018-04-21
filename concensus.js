const fs = require('fs');
const https = require('https');
const express = require('express');
var app = express();

// Config
const configPath = process.argv[2] || 'config.1.json';
const configFile = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configFile);

// Credentials
var certificate = fs.readFileSync(config.certificate, 'utf8');
var privateKey = fs.readFileSync(config.privateKey, 'utf8');
var credentials = { cert: certificate, key: privateKey };

// Create a new block with information
app.post('/create', function (req, res) {
    // Proccess block
    // POST endorse to others
});

// Routes
app.post('/endorse', function (req, res) {
    // Receive new block
    // Verify it (simulate)
    // SEND POST /receiveVersion to everyone else
    // Wait until we receive everyone else version
    // Compare all versions
    // Commit to ledger (persistance module)
    // Respond OK
});

app.post('/receiveVersion', function (req, res) {
    // Push the received hashes into the concensus array
    // We must complete a peers^2 matrix with all the versions of the hashes for full concensus, other strategies are coded here.
    // if all versions are received, emit event to unlock the endorsement function (pipes?)
});

// Server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(config.port, () => console.log(config.name, 'running on port', config.port));