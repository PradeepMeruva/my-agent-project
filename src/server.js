const app = require('./app');

const PORT = parseInt(process.env.PORT, 10) || 3000;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Drift game server listening on http://127.0.0.1:${PORT}`);
});
