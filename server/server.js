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

app.get('/api/suggest_keywords', (req, res) => {
  const keywords = req.query.keywords;
  const suggestions = [
    `${keywords} specialist`,
    `${keywords} associate`,
    `junior ${keywords}`,
    `remote ${keywords}`,
  ];
  res.json({ status: 'success', suggestions });
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
