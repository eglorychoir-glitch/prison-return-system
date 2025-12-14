const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// API endpoint for data transmission (example)
app.post('/api/submit-return', express.json(), (req, res) => {
  console.log('Received return data:', req.body);
  // Here you would process the data, e.g., save to database
  res.json({ success: true, message: 'Return submitted successfully' });
});

// Export the app instead of starting the server automatically
module.exports = app;
