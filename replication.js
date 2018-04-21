const https = require('https');

var postData = JSON.stringify({
    'msg' : 'Hello World!'
});

function sendRequest(peer, postData) {
  
  var options = {
    hostname: peer.hostname,
    port: peer.port,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
  };

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
  
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
    
  req.on('error', (e) => {
    console.error(e);
  });
    
  req.write(postData);
  req.end();
}