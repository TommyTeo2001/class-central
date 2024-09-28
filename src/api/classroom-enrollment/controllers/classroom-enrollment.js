"use strict";
const { captureSentryError } = require("../../../utils/sentryUtil");

/**
 * classroom-enrollment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const {
  enrollUserInCourseOfferingWithoutJob,
} = require("../../../utils/enrollments/courseEnrollments");

module.exports = createCoreController(
  "api::classroom-enrollment.classroom-enrollment",
  ({ strapi }) => ({
    /**
     * Enroll a user into a course offering and update their classroom enrollment record.
     * @return {object}
     */
    async classroomCourseEnrollment(ctx) {
      /**
       * Planning:
       * I need the couurse offering Id, the user Id, and the user email to enroll the user into the course
       * After enrollment, I need to update the classroom enrollment record with the provided classroom enrollment Id
       */
      await this.validateQuery(ctx);
      const sanitizedBody = await this.sanitizeInput(ctx.request.body);
      const { courseOfferingIds, classroomEnrollmentId } = sanitizedBody;
      const { id: userId, email: userEmail } = ctx.state.user;

      // Vaidate the course offering Ids
      if (!Array.isArray(courseOfferingIds) || courseOfferingIds.length === 0) {
        return ctx.badRequest(
          "Course offering Ids must be an array and cannot be empty"
        );
      }
      // Validate the classroom offering Id
      if (!classroomEnrollmentId) {
        return ctx.badRequest("Classroom enrollment Id is required");
      }

      let allCourseEnrollmentRecords = null;
      try {
        allCourseEnrollmentRecords = await enrollUserInCourseOfferingWithoutJob(
          courseOfferingIds,
          userEmail,
          userId
        );
      } catch (error) {
        captureSentryError(
          `Failed to create new course enrollments for User: ${userEmail} in course offering ids: [${courseOfferingIds}]. Errors: ${error?.message}`
        );
        return ctx.badRequest(
          `Failed to create new course enrollments for User: ${userEmail} in course offering ids: [${courseOfferingIds}]. Errors: ${error?.message}`
        );
      }

      // Get enrollment Ids froms the course enroll response
      const enrollmentIds = allCourseEnrollmentRecords.map(({ id }) => id);

      // Update existing classroom enrollment record with course offering ids
      const classroomEnrollment = await strapi.entityService.findOne(
        "api::classroom-enrollment.classroom-enrollment",
        classroomEnrollmentId,
        {
          populate: ["courseEnrollments"],
        }
      );

      if (!classroomEnrollment) {
        captureSentryError(
          `Classroom enrollment record not found for classroom enrollment Id: ${classroomEnrollmentId}`
        );
        return ctx.badRequest("Classroom enrollment record not found");
      }

      // Get the existing course enrollment Ids
      const existingCourseEnrollments =
        classroomEnrollment?.courseEnrollments.map(({ id }) => id);

      // remove duplicates from existingCourseEnrollments afer merging with enrollmentIds
      const uniqueEnrollments = [
        ...new Set([...existingCourseEnrollments, ...enrollmentIds]),
      ];

      try {
        const classroomEnrollResponse = strapi.entityService.update(
          "api::classroom-enrollment.classroom-enrollment",
          classroomEnrollmentId,
          {
            data: {
              courseEnrollments: uniqueEnrollments,
            },
          }
        );

        if (!classroomEnrollResponse) {
          captureSentryError(
            `Failed to update classroom enrollment record for classroom enrollment Id: ${classroomEnrollmentId}`
          );
          return ctx.badRequest("Failed to update classroom enrollment record");
        }

        return ctx.send({
          message: "Successfully enrolled user in course offerings",
          data: allCourseEnrollmentRecords,
        });
      } catch (error) {
        captureSentryError(
          `Failed to update classroom enrollment record. Error: ${error?.message}`
        );
        return ctx.badRequest(
          `Failed to update classroom enrollment record. Error: ${error?.message}`
        );
      }
    },
  })
);
