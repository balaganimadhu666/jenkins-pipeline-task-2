const http = require('node:http');

const VERSION = process.env.APP_VERSION || '1.0.0';

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function createApp() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      return sendJson(res, 200, {
        message: 'Hello from jenkins-demo-app! Built and deployed by a Jenkins pipeline.',
        version: VERSION,
      });
    }

    if (req.method === 'GET' && req.url === '/health') {
      return sendJson(res, 200, { status: 'ok', uptime: process.uptime() });
    }

    return sendJson(res, 404, { error: 'Not found' });
  });
}

module.exports = { createApp };
