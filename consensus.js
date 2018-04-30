const config = require('./config');
const network = require('./network');
const persistance = require('./persistance');
const simulator = require('./simulator');
const Channel = require('async-csp').Channel;

const peers = config.peers;

const Logger = require('./log');
const log = new Logger('consensus', 'green');

var consensusChannel = new Channel();
var endorsements = new Array();

async function broadcastProposal(input) {
    // Send proposals requests to all peers
    log.debug('Broadcasting proposal...');
    var promises = new Array();
    peers.forEach(peer => promises.push(network.sendRequest(peer, '/propose', input)));
    await Promise.all(promises);
}

async function receiveProposal(input) {
    // Simulate the smart contract
    const previousBlock = persistance.getLatestBlock();
    const newBlock = simulator.process(input, previousBlock);
    const currentHash = simulator.hash(newBlock);
    log.debug('New block hash:', currentHash);

    await broadcastEndorsent(currentHash);
    // Wait until we receive everyone else endorsements
    log.debug('Waiting endorsements from others...');
    await consensusChannel.take();

    // Compare all endorsements
    const ok = endorsements.every(endorsement => { return endorsement === currentHash });
    endorsements = new Array();

    if(ok) {
        log.debug('Consensus OK, commiting into ledger...');
        persistance.commitBlock(newBlock);
    } else {
        log.error('Some endorsement is different, commit aborted.');
    }

    return Promise.resolve();
}

async function broadcastEndorsent(hash) {
    const endorsement = {
        "endorsement": hash
    }
    // Broadcast /endorse to everyone else
    log.debug('Broadcasting endorsements...');
    var promises = new Array();
    peers.forEach(peer => promises.push(network.sendRequest(peer, '/endorse', endorsement)));
    await Promise.all(promises);
}

async function receiveEndorsent(endorsement) {
    // Push the received hashes into the concensus array
    endorsements.push(endorsement);
    if(endorsements.length >= peers.length) {
        log.debug('All endorsements arrived, unlock proposal.');
        await consensusChannel.put(endorsements);
    }
}

module.exports = {
    broadcastProposal: broadcastProposal,
    receiveProposal: receiveProposal,
    broadcastEndorsent: broadcastEndorsent,
    receiveEndorsent: receiveEndorsent
}