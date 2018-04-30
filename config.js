// Config
const fs = require('fs');
const configPath = process.argv[2] || './peer1/config.json';
const configFile = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configFile);

module.exports = config;