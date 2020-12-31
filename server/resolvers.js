const db = require("./db");

// Resolve all Jobs
const Query = {
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