const db = require("./db");

// Resolve individual Job, and all Jobs
const Query = {
  job: (root, {id}) => db.jobs.get(id),
  jobs: () => db.jobs.list(),
}

// Resolve the Company referenced by a Job's companyId
const Job = {
  company: (job) => db.companies.get(job.companyId)
}

module.exports = {
  Query,
  Job
}