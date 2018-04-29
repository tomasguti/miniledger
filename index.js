const fs = require('fs');
const https = require('https');
const express = require('express');
const concensus = require('./consensus');
const network = require('./network');
const persistance = require('./persistance');
const simulator = require('./simulator');
const config = require('./config');
const csp = require('js-csp');
const bodyParser = require('body-parser');

// Credentials
const certificate = fs.readFileSync(config.certificate, 'utf8');
const privateKey = fs.readFileSync(config.privateKey, 'utf8');
const credentials = { cert: certificate, key: privateKey };
const peers = config.peers;

var consensusChannel = csp.chan();

// Init Express
var app = express();
app.use(bodyParser.json());

// Create a new block with information
app.post('/create', function (req, res) {

    // TODO: Queue input
    const input = req.body;

    console.log('Received new input:', input);

    // Send verification requests to all peers
    var promises = new Array();
    for (var index = 0; index < peers.length; index++) {
        console.log('Sending verification request to peer:', peers[index].name);
        promises.push(network.sendRequest(peers[index], '/verify', input));
    }

    Promise.all(promises).then(results => {
        console.log(results);
    }, reason => {
        console.error(reason);
    });

    // Verify too
    verify(input).then(() => {
        console.log('Transaction sucessfully created from this node.'); 
    }).catch(reason => {
        console.log('Transaction failed from this node.');
        console.error(reason);
    });

    res.send('OK');
});

// Received a new verification request
app.post('/verify', function (req, res) {
    // Receive new block
    const input = req.body;
    verify(input).then(() => {
        res.send('OK');
    }).catch(reason => {
        console.error(reason);
    });    
});

async function verify(input) {

    // Simulate the smart contract
    const previousBlock = persistance.getLatestBlock();
    const newBlock = simulator.process(input, previousBlock);
    const currentHash = simulator.hash(newBlock);
    console.log('New block hash:', currentHash);

    // Broadcast /endorse to everyone else
    var promises = new Array();
    for (var index = 0; index < peers.length; index++) {
        promises.push(network.sendRequest(peers[index], '/endorse', { "endorsement": currentHash } ));
    }

    console.log('Broadcasting endorsements...');
    await Promise.all(promises).then(results => {
        console.log('Endorsements ACKs:', results);
    }, reason => {
        // Something went wrong
        console.error(reason);
    });

    // Wait until we receive everyone else endorsements
    console.log('Waiting endorsements from others...');
    csp.takeAsync(consensusChannel, value => {
        console.log('We got', value);
        console.log('Endorsements arrived:', endorsements);
        // Compare all versions
        for (var endIndex = 0; endIndex >= endorsements.length; endorsements.length) {
            if(currentHash !== endorsements[endIndex]) {
                console.error('Some endorsement is different, commit aborted.');
                return Promise.reject();
            }
        }
        console.log('All seems OK, commiting into ledger...');
        // Commit to ledger
        persistance.commitBlock(newBlock);
        endorsements = new Array();
    });
    
}

var endorsements = new Array();
app.post('/endorse', function (req, res) {
    const currentHash = req.body.endorsement;
    receiveEndorsent(currentHash).then(() => {
        res.send('OK');
    });
});

async function receiveEndorsent(endorsement) {
    console.log('Endorsement arrived:', endorsement);
    // Push the received hashes into the concensus array
    endorsements.push(endorsement);
    // We must complete a peers^2 matrix with all the versions of the hashes for full concensus, other strategies are coded here.
    
    // if all versions are received, emit event to unlock the verify function (pipes?)
    if(endorsements.length >= peers.length){
        console.log('All endorsements arrived, unlock verification.');
        csp.putAsync(consensusChannel, endorsements);
    }
}

// Temporary solution to free the port
process.on('uncaughtException', function (err) {
    httpsServer.close();
    console.log('Server closed.');
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
})

// Server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(config.port, () => console.log(config.name, 'running on port', config.port));