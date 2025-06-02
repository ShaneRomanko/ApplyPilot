import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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
`remote ${keywords}`,`,
  ];
  res.json({ status: 'success', suggestions });
});

app.post('/api/autoapply', upload.none(), async (req, res) => {
  const { keywords, location, userId, remoteOnly, salaryMin, jobType } = req.body;

  const newApp = {
    job_title: `${keywords} at ${location}`,
    job_url: 'https://example.com/job123',
    applied_at: new Date().toISOString(),
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('applications')
    .insert([newApp]);

  if (error) return res.status(500).json({ status: 'error', message: error.message });
  res.json({ status: 'success', message: 'Applied!', application: newApp });
});

app.get('/api/applications/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('applied_at', { ascending: false });

  if (error) return res.status(500).json({ status: 'error', message: error.message });
  res.json({ status: 'success', applications: data });
});

app.listen(port, () => {
  console.log(\`ApplyPilot backend running on port \${port}\`);
});
