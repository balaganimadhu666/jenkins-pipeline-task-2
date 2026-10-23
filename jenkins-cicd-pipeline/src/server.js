const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;
const server = createApp();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown so `docker stop` exits cleanly
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
