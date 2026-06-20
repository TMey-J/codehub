// server.js
const express = require('express');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Mount API routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
