import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Health check passed');
      process.exit(0);
    } else {
      console.error('❌ Health check failed:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Health check error:', error);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();