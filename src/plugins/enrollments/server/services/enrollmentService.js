"use strict";
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;
const {
  captureSentryErrorAndSetJobStatusToFailed,
  captureSentryError,
} = require("../../../../utils/sentryUtil");
const { createJob, updateJob } = require("../../../../utils/jobsUtil");
const {
  enrollUserInClassroom,
  enrollAdminIntoClassroomNewGroup,
} = require("../../../../utils/enrollments/clasroomEnrollments");
const {
  enrollUserInCourse,
} = require("../../../../utils/enrollments/courseEnrollments");

module.exports = ({ strapi }) => ({
  getWelcomeMessage() {
    return "Welcome to Strapi 🚀";
  },
  async findUsers(ctx) {
    try {
      // const start = ctx?.query?.start || 1;
      const paginatedUsers = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["id", "email", "firstName", "lastName"],
        }
      );
      return { data: paginatedUsers, meta: { pagination: { total: 0 } } };
    } catch (error) {
      throw new ApplicationError("There was an error fetch users", error);
    }
  },
  async enrollAllUsers(ctx) {
    try {
      const userEnrollmentToBeAdded = ctx.request.body;
      let jobsCreated = [];
      const dealySeconds = userEnrollmentToBeAdded.length + 1 * 1000;
      // Create a job for each user
      userEnrollmentToBeAdded.map(async (enrollment) => {
        const { userId, userEmail } = enrollment;
        const jobDescription = `Enroll user ${userEmail} into course and classroom offerings.`;
        try {
          const { id: jobId, jobNumber } = await createJob(jobDescription, {});
          jobsCreated.push({ jobId, userId, userEmail, jsonLogs: {} });
        } catch (error) {
          throw new ApplicationError(
            `There was an error creating a job for ${jobDescription}`,
            error
          );
        }
      });
      await new Promise((resolve) => setTimeout(resolve, dealySeconds));

      userEnrollmentToBeAdded.map(async (enrollment) => {
        const {
          userId,
          userEmail,
          firstName,
          lastName,
          courseOfferings,
          classroomOfferings,
        } = enrollment;
        // find jobId in jobsCreated by userId
        const { jobId, jsonLogs } = jobsCreated.find(
          (job) => job.userId === userId
        );
        const hasCourseOfferingIds = courseOfferings?.length > 0;
        const hasClassroomOfferingIds = classroomOfferings?.length > 0;

        try {
          if (hasClassroomOfferingIds) {
            const classroomOfferingIds = classroomOfferings.map(
              (classroomOffering) => classroomOffering.classroomOfferingId
            );

            const groupInfo = classroomOfferings
              .map((classroomOffering) => {
                if (!!classroomOffering.numberOfSeats) {
                  return {
                    classroomOfferingId: classroomOffering.classroomOfferingId,
                    groupNumOfSeats: classroomOffering.numberOfSeats,
                  };
                }
              })
              .filter(Boolean);

            if (groupInfo.length > 0) {
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
            } else {
              await enrollUserInClassroom(
                jobId,
                jsonLogs,
                classroomOfferingIds,
                userEmail,
                userId,
                hasCourseOfferingIds
              );
            }
          }
          if (hasCourseOfferingIds) {
            // Enroll user in course offerings
            const courseOfferingIds = courseOfferings.map(
              (courseOffering) => courseOffering.courseOfferingId
            );
            await enrollUserInCourse(
              jobId,
              jsonLogs,
              courseOfferingIds,
              userEmail,
              userId,
              false
            );
          }
        } catch (error) {
          const jsonLogs = {
            Failed: `Failed to enroll user ${userEmail} into course and classroom offerings. Error: ${error.message}`,
          };
          await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
          throw new ApplicationError(
            `Failed to enroll user ${userEmail} into course and classroom offerings`,
            error
          );
        }
      });

      return jobsCreated;
    } catch (error) {
      throw new ApplicationError(
        "There was an error fetching enrollments",
        error
      );
    }
  },
  async findJobsByIds(ctx) {
    try {
      const jobIds = ctx.request.body;
      const jobs = await strapi.entityService.findMany("api::job.job", {
        fields: ["id", "jobNumber", "status"],
        filters: {
          id: {
            $in: jobIds,
          },
        },
      });
      return jobs;
    } catch (error) {
      throw new ApplicationError(
        "There was an error fetching jobs by Ids",
        error
      );
    }
  },
  async findAllCourseOfferings(ctx) {
    try {
      const courseOfferings = await strapi.entityService.findMany(
        "api::course-offering.course-offering",
        {
          fields: ["id", "offeringTitle"],
          locale: "all",
        }
      );
      // TODO: Might use this later
      // const classroomOfferings = await strapi.entityService.findMany(
      //   "api::classroom-offering.classroom-offering",
      //   {
      //     populate: {
      //       learningComponents: {
      //         fields: ["id"],
      //         populate: {
      //           courseOffering: {
      //             fields: ["id"],
      //           },
      //         },
      //       },
      //     },
      //   }
      // );

      // Get a list of course offering Ids from learningComponents in classroomOfferings and remove duplicates
      // const courseOfferingIds = classroomOfferings
      //   .map((classroomOffering) => {
      //     return classroomOffering.learningComponents
      //       .filter(
      //         ({ __component }) => __component === "blocks.course-offerings"
      //       )
      //       .map(({ courseOffering }) => courseOffering.id);
      //   })
      //   .flat();
      // // Remove duplicates
      // const uniqueCourseOfferingIds = [...new Set(courseOfferingIds)];

      // // Get course offerings that are not in uniqueCourseOfferingIds
      // const courseOfferingsToBeDisplayed = courseOfferings.filter(
      //   (courseOffering) => {
      //     return !uniqueCourseOfferingIds.includes(courseOffering.id);
      //   }
      // );

      return courseOfferings;
    } catch (error) {
      throw new ApplicationError(
        "There was an error fetching course offerings",
        error
      );
    }
  },
});
