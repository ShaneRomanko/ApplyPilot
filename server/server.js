const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.send('ApplyPilot Backend is live ✈️');
});

// 🔧 Keyword Suggestion API (POST)
app.post('/api/suggest_keywords', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Invalid input' });
  }

  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 4); // remove small filler words

  const freqMap = {};
  for (const word of words) {
    freqMap[word] = (freqMap[word] || 0) + 1;
  }

  const sorted = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const topKeywords = sorted.slice(0, 6); // top 6 keywords

  res.json({ status: 'success', keywords: topKeywords });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ ApplyPilot backend running on port ${PORT}`);
});