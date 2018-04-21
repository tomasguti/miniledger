const fs = require('fs');

const blocksFolder = './blocks/';
const blocksPrefix = 'blocks_';

const indexFile = 'CURRENT';
const currentBlockIndex = null;

// Block operations
function read (blockIndex) {
    var index = blockIndex || getCurrentBlockIndex();
    var blockFilePath = getBlockPath(index);
    var blockFile = fs.readFileSync(blockFilePath);
    var block = JSON.parse(blockFile);
    return block;
}

function save (block) {
    var index = getCurrentBlockIndex();
    var blockFilePath = getBlockPath(index);
    fs.writeFileSync(blockFilePath, JSON.stringify(block));
    addOneToCurrentBlockIndex();
}

// Index persistance and recovery
function getCurrentBlockIndex() {
    if (currentBlockIndex) return currentBlockIndex;
    var currentIndexFile = fs.readFileSync(indexFile);
    // TODO: Create zero file if error
    return parseInt(currentIndexFile);
}

function addOneToCurrentBlockIndex() {
    currentBlockIndex = getCurrentBlockIndex();
    currentBlockIndex++;
    fs.writeFileSync(indexFile, currentBlockIndex.toString());
    return currentBlockIndex;
}

// Utils
function getBlockPath (index) {
    return blocksFolder + blocksPrefix + index;
}

module.exports = {
    readBlock: read,
    commitBlock: save,
    getBlockIndex: getBlockIndex
}