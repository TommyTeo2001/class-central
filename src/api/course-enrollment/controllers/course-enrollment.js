"use strict";
const {
  updateJob,
  jobStatuses,
  retrieveJobById,
} = require("../../../utils/jobsUtil");
const {
  captureSentryErrorAndSetJobStatusToFailed,
  captureSentryError,
} = require("../../../utils/sentryUtil");
const { groupBy } = require("lodash");

const {
  enrollUserInClassroom,
  enrollAdminIntoClassroomNewGroup,
} = require("../../../utils/enrollments/clasroomEnrollments");
const {
  enrollUserInCourse,
} = require("../../../utils/enrollments/courseEnrollments");

/**
 * course-enrollment controller
 * * This controller is responsible for creating course and classroom enrollments
 * * Through the payment method
 */
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::course-enrollment.course-enrollment",
  ({ strapi }) => ({
    /**
     * Create course and classroom enrollment records.
     *
     * @return {Object}
     */
    async createEnrollments(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);
      const sanitizedBody = await this.sanitizeInput(ctx.request.body);
      const {
        courseOfferingIds,
        classroomOfferingIds,
        jobId,
        sessionId,
        orderId,
        groupNumOfSeats,
      } = sanitizedBody;
      const {
        id: userId,
        email: userEmail,
        firstName,
        lastName,
      } = ctx.state.user;

      // Add order to each groupNumOfSeats
      const groupInfo =
        groupNumOfSeats.length > 0
          ? groupNumOfSeats.map((group) => ({
              ...group,
              orderId,
            }))
          : [];

      // Get job by id
      const job = await retrieveJobById(jobId);
      if (!job) {
        captureSentryError(
          new Error(
            `Job: ${jobId} was not created for sessionId: ${sessionId}.`
          )
        );
        return ctx.notFound(
          `Job: ${jobId} was not created for sessionId: ${sessionId}.`
        );
      }
      const { jsonLogs, status } = job;

      // Check if job is already completed or failed
      if (status === jobStatuses.COMPLETED) {
        return ctx.send({
          status: 400,
          error: {
            message: `Job: ${jobId} is already completed.`,
          },
        });
      }
      if (status === jobStatuses.FAILED) {
        return ctx.send({
          status: 400,
          error: {
            message: `Job: ${jobId} is already failed.`,
          },
        });
      }
      // Define step number and warning number for logs
      const hasClassroomOfferingIds =
        Array.isArray(classroomOfferingIds) && classroomOfferingIds.length > 0;
      const hasCourseOfferingIds =
        Array.isArray(courseOfferingIds) && courseOfferingIds.length > 0;
      const hasGroupInfo = groupInfo.length > 0;

      if (hasClassroomOfferingIds && !hasGroupInfo) {
        await enrollUserInClassroom(
          jobId,
          jsonLogs,
          classroomOfferingIds,
          userEmail,
          userId,
          hasCourseOfferingIds
        );
      }

      if (hasClassroomOfferingIds && hasGroupInfo) {
        await enrollAdminIntoClassroomNewGroup(
          jobId,
          jsonLogs,
          classroomOfferingIds,
          userEmail,
          userId,
          firstName,
          lastName,
          hasCourseOfferingIds,
          groupInfo
        );
      }

      if (hasCourseOfferingIds) {
        await enrollUserInCourse(
          jobId,
          jsonLogs,
          courseOfferingIds,
          userEmail,
          userId
        );
      }
      return ctx.send({
        status: 200,
        jobId,
      });
    },
  })
);
