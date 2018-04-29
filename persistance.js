const fs = require('fs');
const config = require('./config');

const blocksFolder = './blocks/' + config.name + '/';
const blocksPrefix = 'block_';
const blocksExtension = '.json';

const indexFile = blocksFolder + config.name + '_LATEST';
var latestBlock = null;
var latestBlockIndex = null;

// Block operations
function read (blockIndex) {
    var index = blockIndex || getLatestBlockIndex();
    var blockFilePath = getBlockPath(index);
    var blockFile = fs.readFileSync(blockFilePath);
    var block = JSON.parse(blockFile);
    return block;
}

function save (block) {
    addOneTolatestBlockIndex();
    var index = getLatestBlockIndex();
    var blockFilePath = getBlockPath(index);
    fs.writeFileSync(blockFilePath, JSON.stringify(block));
    latestBlock = block;
}

function getLatestBlock() {
    if (latestBlock) return latestBlock;
    var latestBlockIndex = getLatestBlockIndex();
    return read(latestBlockIndex);
}

// Index persistance and recovery
function getLatestBlockIndex() {
    if (latestBlockIndex) return latestBlockIndex;
    var latestIndexFile = fs.readFileSync(indexFile);
    // TODO: Create zero file if error
    return parseInt(latestIndexFile);
}

function addOneTolatestBlockIndex() {
    latestBlockIndex = getLatestBlockIndex();
    latestBlockIndex++;
    fs.writeFileSync(indexFile, latestBlockIndex.toString());
    return latestBlockIndex;
}

// Utils
function getBlockPath (index) {
    return blocksFolder + blocksPrefix + index + blocksExtension;
}

module.exports = {
    readBlock: read,
    commitBlock: save,
    getLatestBlock: getLatestBlock,
    getLatestBlockIndex: getLatestBlockIndex
}