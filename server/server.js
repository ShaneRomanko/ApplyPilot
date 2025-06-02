import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import suggestKeywords from './utils/suggestKeywords.js';
import autoApply from './utils/autoApply.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for resume upload
const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Routes
app.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const resumeText = await fs.readFile(filePath, 'utf8');

    const keywords = suggestKeywords(resumeText);
    const suggestions = [
      `${keywords} specialist`,
      `${keywords} associate`,
      `junior ${keywords}`,
      `remote ${keywords}`,
    ];

    await fs.unlink(filePath); // Clean up uploaded file
    res.json({ keywords, suggestions });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

app.post('/apply', async (req, res) => {
  const { resumeText, keywords, location } = req.body;

  const newApp = {
    resume_text: resumeText,
    keywords: keywords,
    location: location,
    job_title: `${keywords} at ${location}`,
    applied_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('applications').insert([newApp]);

  if (error) {
    console.error('Error inserting application:', error);
    res.status(500).json({ error: 'Failed to apply' });
  } else {
    res.json({ success: true, data });
  }
});

app.listen(port, () => {
  console.log(`ApplyPilot backend running on port ${port}`);
});
