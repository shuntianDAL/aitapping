// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Parse JSON bodies
app.use(express.json());

// API endpoint to call the AI API
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling AI API:', error);
    res.status(500).json({ error: 'Failed to call AI API' });
  }
});

// Serve the public folder as normal
app.use(express.static(path.join(__dirname, 'public')));

// Serve the images from the "source" folder under the /images URL prefix
app.use('/source', express.static(path.join(__dirname, 'source')));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
