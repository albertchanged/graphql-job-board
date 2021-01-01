const db = require("./db");

// Resolve individual Job, and all Jobs
const Query = {
  job: (root, {id}) => db.jobs.get(id),
  jobs: () => db.jobs.list(),
  company: (root, {id}) => db.companies.get(id)
}

const Mutation = {
  createJob: (root, {input}, {user}) => {
    // Check that user is authenticated
    if (!user) throw new Error("Unauthorized");

    const id = db.jobs.create({
      ...input,
      companyId: user.companyId
    });
    return db.jobs.get(id);
  }
}

// Resolve the Company referenced by a Job's companyId
const Job = {
  company: (job) => db.companies.get(job.companyId)
}

const Company = {
  jobs: (company) => db.jobs.list()
    .filter((job) => job.companyId === company.id)
}

module.exports = {
  Query,
  Mutation,
  Job,
  Company
}