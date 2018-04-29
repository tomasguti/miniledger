const https = require('https');

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
    console.log('OPTIONS', options);
    var req = https.request(options, (res) => {
      var data = '';
      console.log(options.path, 'statusCode:', res.statusCode);
    
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });
      
    req.on('error', (e) => {
      console.error(e);
      reject();
    });
      
    req.write(postData);
    req.end();
  });
  
}

module.exports = {
   sendRequest: sendRequest
}