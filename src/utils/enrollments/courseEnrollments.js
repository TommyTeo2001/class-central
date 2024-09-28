const { updateJob, jobStatuses } = require("../jobsUtil");
const {
  captureSentryErrorAndSetJobStatusToFailed,
  captureSentryError,
} = require("../sentryUtil");
const { groupBy } = require("lodash");
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

async function enrollUserInCourse(
  jobId,
  jsonLogs,
  courseOfferingIds,
  userEmail,
  userId
) {
  // Enroll user in course offerings
  if (courseOfferingIds.length > 0) {
    const existingCourseEnrollments = await strapi.entityService.findMany(
      "api::course-enrollment.course-enrollment",
      {
        filters: {
          userId: userId,
          enrollmentId: {
            $in: courseOfferingIds.map((id) => `CE-${id}-${userId}`),
          },
        },
        locale: "all",
      }
    );

    // Filter out existing course enrollments
    const newCourseOfferingIds = courseOfferingIds.filter(
      (courseOfferingId) =>
        !existingCourseEnrollments.some(
          ({ enrollmentId }) =>
            enrollmentId === `CE-${courseOfferingId}-${userId}`
        )
    );

    if (newCourseOfferingIds.length > 0) {
      // Create new course enrollments
      const newCourseEnrollmentPromises = newCourseOfferingIds.map(
        (courseOffering) =>
          strapi.entityService.create(
            "api::course-enrollment.course-enrollment",
            {
              data: {
                userId: userId.toString(),
                userEmail,
                courseOffering,
              },
            }
          )
      );

      let newCourseEnrollmentResponse = [];
      try {
        newCourseEnrollmentResponse = await Promise.all(
          newCourseEnrollmentPromises
        );
      } catch (error) {
        jsonLogs[
          "Failed"
        ] = `Failed to create new course enrollments for User: ${userEmail} in course offering ids: [${courseOfferingIds}]. Errors: ${error}`;
        captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        throw new ApplicationError(
          `Failed to create new course enrollments for User: ${userEmail} in course offering ids: [${courseOfferingIds}]`,
          error
        );
      }

      jsonLogs[
        `Course Enrollments`
      ] = `Successfully created these course enrollments: [${newCourseEnrollmentResponse
        .map((response) => response?.enrollmentId)
        .join(", ")}] for User: ${userEmail}`;
    } else {
      jsonLogs[
        `Course Enrollments warning`
      ] = `No new course enrollments were created for User: ${userEmail} in course offering ids: [${courseOfferingIds}]`;
    }
  }
  await updateJob(jobId, {
    status: jobStatuses.COMPLETED,
    jsonLogs,
  });
}

async function enrollUserInCourseOfferingWithoutJob(
  courseOfferingIds,
  userEmail,
  userId
) {
  let allEnrollmentRecords = [];
  const existingCourseEnrollments = await strapi.entityService.findMany(
    "api::course-enrollment.course-enrollment",
    {
      filters: {
        userId: userId,
        enrollmentId: {
          $in: courseOfferingIds.map((id) => `CE-${id}-${userId}`),
        },
      },
      populate: {
        courseOffering: {
          fields: ["id", "slug"],
        },
      },
    }
  );

  if (
    Array.isArray(existingCourseEnrollments) &&
    existingCourseEnrollments.length > 0
  ) {
    allEnrollmentRecords.push(...existingCourseEnrollments);
  }

  // Filter out existing course enrollments
  const newCourseOfferingIds = courseOfferingIds.filter(
    (courseOfferingId) =>
      !existingCourseEnrollments.some(
        ({ enrollmentId }) =>
          enrollmentId === `CE-${courseOfferingId}-${userId}`
      )
  );

  if (newCourseOfferingIds.length > 0) {
    // Create new course enrollments
    const newCourseEnrollmentPromises = newCourseOfferingIds.map(
      (courseOffering) =>
        strapi.entityService.create(
          "api::course-enrollment.course-enrollment",
          {
            data: {
              userId: userId.toString(),
              userEmail,
              courseOffering,
            },
            populate: {
              courseOffering: {
                fields: ["id", "slug"],
              },
            },
          }
        )
    );
    const newResponse = await Promise.all(newCourseEnrollmentPromises);
    allEnrollmentRecords.push(...newResponse);
  }
  return allEnrollmentRecords;
}

module.exports = {
  enrollUserInCourse,
  enrollUserInCourseOfferingWithoutJob,
};
