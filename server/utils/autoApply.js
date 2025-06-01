// utils/autoApply.js
export async function autoApplyToJobs({ keywords, location, resume, userId, remoteOnly, salaryMin, jobType }, supabase) {
  const fakeJobs = [
    {
      job_title: `${keywords} Specialist at TechCorp`,
      job_url: 'https://jobboard.com/job1234',
    },
    {
      job_title: `${keywords} Coordinator at BizGroup`,
      job_url: 'https://jobboard.com/job5678',
    },
  ];

  const applied = [];

  for (const job of fakeJobs) {
    console.log(`Applying to ${job.job_title}`);

    const { error } = await supabase.from('applications').insert({
      user_id: userId,
      job_title: job.job_title,
      job_url: job.job_url,
      applied_at: new Date().toISOString()
    });

    if (!error) applied.push(job);
  }

  return applied;
}