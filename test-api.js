const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/submit-return',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', (d) => {
    console.log('Response:', d.toString());
  });
});

req.write('{"test":"data"}');
req.end();
