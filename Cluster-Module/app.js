const express = require('express');
const app = express();

app.use((req, res, next) => {
  console.log(`Worker ${process.pid} handling ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send(`Hello from Express worker ${process.pid}`);
});

app.get('/crash', (req, res) => {
  console.log(`Worker ${process.pid} crashing...`);
  res.send(`Worker ${process.pid} is crashing...`);
  process.exit(1);
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Worker ${process.pid} started and listening on port ${PORT}`);
});
