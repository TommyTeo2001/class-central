const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;

const jobStatuses = {
  RUNNING: "Running ⏱️",
  COMPLETED: "Completed ✅",
  FAILED: "Failed ⛔",
};

/**
 *  Create a job but with extra data to be added
 * @param {string} jobDescription
 * @returns
 */
async function createJob(jobDescription, extraData) {
  // Constructor a dynamic data for the job
  const newData = {
    description: jobDescription,
    ...extraData,
  };

  const jobResponse = await strapi.entityService.create("api::job.job", {
    data: newData,
  });
  const { id, jobNumber } = jobResponse;
  return { jobNumber, id };
}

/**
 * Update the job with the given jobId and extra data
 * @param {number} jobId
 * @param {enum} jobStatus
 * @param {string} logs
 * @returns
 */
async function updateJob(jobId, extraData) {
  const jobResponse = await strapi.entityService.update("api::job.job", jobId, {
    data: extraData,
  });
  return jobResponse;
}

/**
 * Check if job status is completed
 *
 */
async function isJobCompleted(jobId) {
  const job = await strapi.entityService.findOne("api::job.job", jobId, {
    field: ["status"],
  });
  const { status } = job;
  return status === jobStatuses.COMPLETED;
}

/**
 * Retrieve the job with the given jobId
 */
async function retrieveJobById(jobId) {
  return await strapi.entityService.findOne("api::job.job", jobId);
}

module.exports = {
  createJob,
  jobStatuses,
  updateJob,
  isJobCompleted,
  retrieveJobById,
};
