const crypto = require('crypto');

function simulateBlock (inputData, previousBlock) {

    const previousBlockHash = hash(previousBlock);
    const dataHash = hash(inputData);
    
    var newblock = {
        previousBlockHash: previousBlockHash,
        dataHash: dataHash,
        data: inputData
    }

    return newblock;
}

function hash(data) {

    const hash = crypto.createHash('sha256');
    const dataString = JSON.stringify(data);

    hash.update(dataString);

    return hash.digest('hex');
}

module.exports = {
    process: simulateBlock
};