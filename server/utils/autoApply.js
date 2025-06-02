module.exports = async function autoApply(req, res) {
  // Placeholder logic - you can customize this later
  const { resumeText, keywords, location, userId } = req.body;

  const newApp = {
    job_title: `${keywords} at ${location}`,
    job_url: 'https://example.com/job123',
    applied_at: new Date().toISOString(),
    user_id: userId,
  };

  res.json({ status: 'simulated', data: newApp });
};