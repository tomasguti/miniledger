const fs = require('fs');
const https = require('https');
const express = require('express');
const concensus = require('./consensus');
const config = require('./config');
const bodyParser = require('body-parser');
const Logger = require('./log');
const log = new Logger('index', 'blue');

// Credentials
const certificate = fs.readFileSync(config.certificate, 'utf8');
const privateKey = fs.readFileSync(config.privateKey, 'utf8');
const credentials = { cert: certificate, key: privateKey };
const peers = config.peers;

// Init Express
var app = express();
app.use(bodyParser.json());

// Create a new block with information
app.post('/create', async function (req, res) {
    // TODO: Queue input
    const input = req.body;
    log.debug('Received new input:', input);
    concensus.broadcastProposal(input);
    // Verify in this node too
    await concensus.receiveProposal(input);
    res.send('OK');
});

// Received a new proposal request
app.post('/propose', async function (req, res) {
    // Receive new block
    const input = req.body;
    log.debug('Received new proposal:', input);
    await concensus.receiveProposal(input);
    res.send('OK');  
});

app.post('/endorse', function (req, res) {
    const input = req.body.endorsement;
    log.debug('Received new endorsement:', input);
    concensus.receiveEndorsent(input);
    res.send('OK');
});

// Temporary solution to free the port
process.on('uncaughtException', function (err) {
    httpsServer.close();
    log.debug('Server closed.');
    log.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    log.error(err.stack);
    process.exit(1);
})

// Server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(config.port, () => log.debug(config.name, 'running on port', config.port));