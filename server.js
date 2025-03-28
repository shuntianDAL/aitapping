// server.js
require('dotenv').config(); // Loads variables from .env
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY; // Your secret key stored in .env or Render environment

// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint that calls the DeepSeek AI API with your secret API key
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

// Serve static files from the "public" folder (index.html, script.js, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
