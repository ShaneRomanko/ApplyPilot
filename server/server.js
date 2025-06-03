const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs/promises');
const autoApply = require('./utils/autoApply');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const upload = multer();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(cors());
app.use(express.json());

app.post('/api/suggest_keywords', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Invalid input' });
  }

  // Simple keyword extraction based on word frequency
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 4); // ignore very short words

  const freqMap = {};
  for (const word of words) {
    freqMap[word] = (freqMap[word] || 0) + 1;
  }

  const sorted = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const topKeywords = sorted.slice(0, 6); // top 6 most frequent keywords

  res.json({ status: 'success', keywords: topKeywords });
});
app.post('/api/autoapply', upload.none(), async (req, res) => {
  const { resumeText, keywords, location, userId } = req.body;

  const newApp = {
    job_title: `${keywords} at ${location}`,
    job_url: 'https://example.com/job123',
    applied_at: new Date().toISOString(),
    user_id: userId,
  };

  const { data, error } = await supabase.from('applications').insert([newApp]);

  if (error) {
    console.error('Database insert error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to save application.' });
  }

  res.json({ status: 'success', data });
});

app.listen(port, () => {
  console.log(`ApplyPilot backend running on port ${port}`);
});

app.use(express.json());

app.post('/api/career_guide', async (req, res) => {
  const { interests } = req.body;
  if (!interests) {
    return res.status(400).json({ status: 'error', message: 'Missing interests input.' });
  }

  try {
    const prompt = `I am a career coach AI. Based on the user's personal interests: "${interests}", recommend 3 ideal career paths that align with their values. Then, suggest a step-by-step job search plan for the next 5 days, including practical actions (networking, messages, research, etc). Output in JSON.`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const aiText = completion.data.choices[0].message.content;
    res.json({ status: 'success', data: aiText });
  } catch (error) {
    console.error('Career guide error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate career guide.' });
  }
});