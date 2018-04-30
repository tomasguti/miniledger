const https = require('https');
const Logger = require('./log');
const log = new Logger('network', 'magenta');

function sendRequest(peer, endPoint, jsonData) {

  const postData = JSON.stringify(jsonData);
  
  var options = {
    hostname: peer.hostname,
    port: peer.port,
    path: endPoint,
    method: 'POST',
    rejectUnauthorized: false,
    headers : {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
   }
  };

  return new Promise((resolve, reject) => {
    log.debug('SENDING', `${options.hostname}:${options.port}${options.path}`);
    var req = https.request(options, (res) => {
      var data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        log.debug('ACK', `${options.hostname}:${options.port}${options.path}`, 'statusCode:', res.statusCode);
        resolve(data);
      });
    });
    req.on('error', (e) => {
      log.error(e);
      reject();
    });
    req.write(postData);
    req.end();
  });
  
}

module.exports = {
   sendRequest: sendRequest
}