const { jobStatuses, updateJob } = require("../../src/utils/jobsUtil");
const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;

/**
 *  Generic method to capture errors and send to sentry
 * @param error
 */
function captureSentryError(error) {
  const sentryService = strapi.plugin("sentry").service("sentry");
  strapi.plugin("sentry").service("sentry").sendError(error);
}

/**
 * Generic method to update the job status to failed and send the error to sentry
 */
async function captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs) {
  const { FAILED } = jobStatuses;
  try {
    await updateJob(jobId, { status: FAILED, jsonLogs });
    captureSentryError(JSON.stringify(jsonLogs?.Failed || jsonLogs));
  } catch (error) {
    captureSentryError(
      error?.message || "Failed to update job status to failed"
    );
  }
}

/**
 * Capture sentry error and throw application error
 */
function captureSentryErrorAndThrowApplicationError(error) {
  captureSentryError(error);
  throw new ApplicationError(error);
}

/**
 * Capture sentry error and return badRequest
 */
function captureSentryErrorAndReturnBadRequest(error, ctx) {
  captureSentryError(error);
  return ctx.badRequest(error);
}

module.exports = {
  captureSentryError,
  captureSentryErrorAndSetJobStatusToFailed,
  captureSentryErrorAndThrowApplicationError,
  captureSentryErrorAndReturnBadRequest
};
