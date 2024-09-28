const { updateJob, jobStatuses } = require("../jobsUtil");
const {
  captureSentryErrorAndSetJobStatusToFailed,
  captureSentryError,
} = require("../sentryUtil");
const { enrollUserInCourse } = require("./courseEnrollments");
const { groupBy } = require("lodash");
const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;
const {
  sendEmailWithTemplateId,
  DynamicEmailTemplateIds,
} = require("../../utils/sendgrid");

/**
 * This is the main function to enroll users into a classroom using the classroom offering ids
 * This method includes a created job to track the progress of the enrollment
 * ! This function should called first before enrollUserInCourse in `./courseEnrollments.js`
 * @param {*} jobId Id of the job created
 * @param {*} jsonLogs JSON object to store logs
 * @param {*} classroomOfferingIds Array of classroom offering ids
 * @param {*} userEmail Email of the user to enroll
 * @param {*} userId Id of the user to enroll
 * @param {*} hasCourseOfferingIds Boolean to check if there are course offering ids
 * @returns
 */
async function enrollUserInClassroom(
  jobId,
  jsonLogs,
  classroomOfferingIds,
  userEmail,
  userId,
  hasCourseOfferingIds
) {
  // Enroll user in classroom offerings
  if (classroomOfferingIds.length > 0) {
    // Find all classroom offerings of classroom ids
    const classroomOfferings = await strapi.entityService.findMany(
      "api::classroom-offering.classroom-offering",
      {
        filters: {
          id: {
            $in: classroomOfferingIds,
          },
        },
      }
    );

    if (!classroomOfferings || classroomOfferings.length === 0) {
      jsonLogs[
        "Failed"
      ] = `Classroom Enrollment: There were no Classroom offerings found for classroom ids: ${classroomOfferingIds}.`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Enrollment: There were no Classroom offerings found for classroom ids: ${classroomOfferingIds}.`
      );
    }

    // Find existing classroom offerings enrollments
    const existingClassroomEnrollments = await strapi.entityService.findMany(
      "api::classroom-enrollment.classroom-enrollment",
      {
        filters: {
          userId: userId,
          enrollmentId: {
            $in: classroomOfferingIds.map((id) => `CLE-${id}-${userId}`),
          },
        },
      }
    );

    if (
      Array.isArray(existingClassroomEnrollments) &&
      existingClassroomEnrollments.length > 0
    ) {
      jsonLogs[
        `Classroom enrollment Warning 1`
      ] = `User: ${userEmail} already has classroom enrollments for classroom offerings: [${existingClassroomEnrollments
        .map((enrollment) => enrollment.enrollmentId)
        .join(", ")}]`;
    }

    // Filter out existing classroom enrollments
    const newClassroomOfferingIds = classroomOfferingIds.filter(
      (classroomOfferingId) =>
        !existingClassroomEnrollments.some(
          ({ enrollmentId }) =>
            enrollmentId === `CLE-${classroomOfferingId}-${userId}`
        )
    );

    if (newClassroomOfferingIds.length === 0) {
      jsonLogs[
        `Classroom enrollment Warning 2`
      ] = `No new classroom enrollments were created for User: ${userEmail} in classroom offering ids: [${classroomOfferingIds}]`;
      await updateJob(jobId, {
        jsonLogs,
      });

      if (!hasCourseOfferingIds) {
        await updateJob(jobId, {
          jsonLogs,
          status: jobStatuses.COMPLETED,
        });
      }
      return [];
    }

    const newClassroomEnrollmentPromises = newClassroomOfferingIds.map(
      (classroomOffering) =>
        strapi.entityService.create(
          "api::classroom-enrollment.classroom-enrollment",
          {
            data: {
              userId: userId.toString(),
              userEmail,
              classroomOffering,
              role: "Learner",
              enrollmentId: `CLE-${classroomOffering}-${userId}`,
            },
          }
        )
    );

    let classroomEnrollmentResponse = [];
    try {
      classroomEnrollmentResponse = await Promise.all(
        newClassroomEnrollmentPromises
      );
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `Classroom Enrollment: Failed to create classroom enrollments for User: ${userEmail} in classroom ids: [${classroomOfferingIds}]. Errors: ${error?.message}`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Enrollment: Failed to create classroom enrollments for User: ${userEmail} in classroom ids: [${classroomOfferingIds}]`,
        error
      );
    }

    jsonLogs[
      `Classroom Enrollments`
    ] = `Successfully created these classroom enrollments: [${classroomEnrollmentResponse
      .map((response) => response?.enrollmentId)
      .join(", ")}] for User: ${userEmail}`;
    await updateJob(jobId, {
      jsonLogs,
    });

    if (!hasCourseOfferingIds) {
      await updateJob(jobId, {
        jsonLogs,
        status: jobStatuses.COMPLETED,
      });
    }
    return classroomEnrollmentResponse;
  }
}

/**
 * This is the main function to enroll admin users into a classroom using the classroom offering ids and
 * creating and adding them into a group. This method includes a created job to track the progress of the enrollment
 * ! This function should called first before enrollUserInCourse in `./courseEnrollments.js`
 * @param {*} jobId Id of the job created
 * @param {*} jsonLogs JSON object to store logs
 * @param {*} classroomOfferingIds Array of classroom offering ids
 * @param {*} userEmail Email of the user to enroll
 * @param {*} userId Id of the user to enroll
 * @param {*} firstName First name of the user to enroll
 * @param {*} lastName Last name of the user to enroll
 * @param {*} hasCourseOfferingIds Boolean to check if there are course offering ids
 * @param {*} groupInfo Group information to enroll (admin) user in groups
 * @returns
 */
async function enrollAdminIntoClassroomNewGroup(
  jobId,
  jsonLogs,
  classroomOfferingIds,
  userEmail,
  userId,
  firstName,
  lastName,
  hasCourseOfferingIds,
  groupInfo
) {
  // Enroll user in classroom offerings
  if (classroomOfferingIds.length > 0) {
    // Find all classroom offerings of classroom ids
    const classroomOfferings = await strapi.entityService.findMany(
      "api::classroom-offering.classroom-offering",
      {
        filters: {
          id: {
            $in: classroomOfferingIds,
          },
        },
        locale: "all",
      }
    );

    if (!classroomOfferings || classroomOfferings.length === 0) {
      jsonLogs[
        "Failed"
      ] = `Classroom Admin Enrollment: There were no Classroom offerings found for classroom with ids: ${classroomOfferingIds}.`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Admin Enrollment: There were no Classroom offerings found for classroom with ids: ${classroomOfferingIds}.`
      );
    }

    // Create all groups from the groupInfo
    let createdGroupsResponse = [];
    try {
      createdGroupsResponse = await Promise.all(
        groupInfo.map((group) =>
          strapi.entityService.create("api::group.group", {
            data: {
              groupName: "Equip Group",
              classroomOfferings: {
                connect: [{ id: group?.classroomOfferingId }],
              },
              order: !!group?.orderId
                ? {
                    connect: [{ id: group?.orderId }], // Test this
                  }
                : null,
              numberOfSeats: group.groupNumOfSeats - 1,
              admins: {
                connect: [{ id: userId }],
              },
            },
            populate: {
              classroomOfferings: {
                fields: ["id"],
              },
            },
          })
        )
      );
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `Classroom Admin Enrollment: Failed to create groups for Admin User: ${userEmail} with classroom offering ids: [${classroomOfferingIds}]. Errors: ${error?.message}`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Admin Enrollment: Failed to create groups for Admin User: ${userEmail} with classroom offering ids: [${classroomOfferingIds}]`,
        error
      );
    }

    jsonLogs[
      `Groups`
    ] = `Successfully created these groups: [${createdGroupsResponse.map(
      (response) => response?.id
    )}] for Admin User: ${userEmail}`;

    const newClassroomEnrollmentPromises = classroomOfferingIds.map(
      (classroomOffering) => {
        const groupdId = createdGroupsResponse.find(
          (group) => group.classroomOfferings[0].id === classroomOffering
        );
        return strapi.entityService.create(
          "api::classroom-enrollment.classroom-enrollment",
          {
            data: {
              userId: userId.toString(),
              userEmail,
              classroomOffering,
              role: groupdId ? "Admin" : "Learner",
              enrollmentId: groupdId
                ? `CLE-${classroomOffering}-${userId.toString()}-${
                    groupdId?.id
                  }`
                : `CLE-${classroomOffering}-${userId.toString()}`,
            },
          }
        );
      }
    );

    let classroomEnrollmentResponse = [];
    try {
      classroomEnrollmentResponse = await Promise.all(
        newClassroomEnrollmentPromises
      );
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `Classroom Admin Enrollment: Failed to create classroom enrollments for User: ${userEmail} in classroom ids: [${classroomOfferingIds}]. Errors: ${error?.message}`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Admin Enrollment: Failed to create classroom enrollments for User: ${userEmail} in classroom ids: [${classroomOfferingIds}]`,
        error
      );
    }

    jsonLogs[
      `Classroom Admin Enrollments`
    ] = `Successfully created these classroom enrollments: [${classroomEnrollmentResponse
      .map((response) => response?.enrollmentId)
      .join(", ")}] for User: ${userEmail}`;

    // After successful enrollment, send an email to the admin user with the group information
    const adminName =
      firstName && lastName ? `${firstName} ${lastName}` : userEmail;
    const classroomPage = `${process.env.CLIENT_PRODUCTION_URL}/myLearning`;

    try {
      await sendEmailWithTemplateId(
        userEmail,
        DynamicEmailTemplateIds.ADMIN_GROUP_PURCHASE,
        {
          classroomUrl: `${classroomPage}`,
          adminName,
        }
      );
    } catch (error) {
      jsonLogs[
        "Send email Warning"
      ] = `Classroom Admin Enrollment: Failed to send email to Admin User: ${userEmail} with classroom offering ids: [${classroomOfferingIds}]. Errors: ${error?.message}`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Admin Enrollment: Failed to send email to Admin User: ${userEmail} with classroom offering ids: [${classroomOfferingIds}]`,
        error
      );
    }

    if (!hasCourseOfferingIds) {
      await updateJob(jobId, {
        jsonLogs,
        status: jobStatuses.COMPLETED,
      });
    } else {
      await updateJob(jobId, {
        jsonLogs,
      });
    }
    return classroomEnrollmentResponse;
  }
}

/**
 * This is the main function to enroll learners into a classroom using the classroom offering ids and adding
 * them into existing groups. This method includes a created job to track the progress of the enrollment
 * ! This function should called first before enrollUserInCourse in `./courseEnrollments.js`
 * @param {*} jobId Id of the job created
 * @param {*} jsonLogs JSON object to store logs
 * @param {*} classroomOfferingIds Array of classroom offering ids
 * @param {*} userEmail Email of the user to enroll
 * @param {*} userId Id of the user to enroll
 * @param {*} hasCourseOfferingIds Boolean to check if there are course offering ids
 * @param {*} groupInfo An array of group Ids to enroll (learner) in existing groups
 * @returns
 */
async function enrollLearnerIntoClassroomExistingGroup(
  jobId,
  jsonLogs,
  classroomOfferingIds,
  userEmail,
  userId,
  hasCourseOfferingIds,
  groupInfo
) {
  // Enroll user in classroom offerings
  if (classroomOfferingIds.length > 0) {
    // Find all classroom offerings of classroom ids
    const classroomOfferings = await strapi.entityService.findMany(
      "api::classroom-offering.classroom-offering",
      {
        filters: {
          id: {
            $in: classroomOfferingIds,
          },
        },
        locale: "all",
      }
    );

    if (!classroomOfferings || classroomOfferings.length === 0) {
      jsonLogs[
        "Failed"
      ] = `Classroom Learner Enrollment: There were no Classroom offerings found for classroom with ids: ${classroomOfferingIds}.`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Learner Enrollment: There were no Classroom offerings found for classroom with ids: ${classroomOfferingIds}.`
      );
    }

    // Update all groups from the groupInfo with userId as a learner
    let updatedGroupsResponse = [];
    try {
      updatedGroupsResponse = await Promise.all(
        groupInfo.map((group) =>
          strapi.entityService.update("api::group.group", group, {
            data: {
              learners: {
                connect: [{ id: userId }],
              },
            },

            populate: {
              classroomOfferings: {
                fields: ["id"],
              },
            },
          })
        )
      );
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `Classroom Learner Enrollment: Failed to update groups for User: ${userEmail} with classroom offering ids: [${classroomOfferingIds}]. Errors: ${error?.message}`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Learner Enrollment: Failed to update groups for User: ${userEmail} with classroom offering ids: [${classroomOfferingIds}]`,
        error
      );
    }

    jsonLogs[
      `Groups`
    ] = `Successfully added learner: [${userEmail}] these groups: [${updatedGroupsResponse.map(
      (response) => response?.id
    )}]`;

    // Generate an array of enrollmentIds of classroom offering id with group id
    const existingEnrollments = updatedGroupsResponse
      .map((group) =>
        classroomOfferingIds.map(
          (classroomOfferingId) =>
            `CLE-${classroomOfferingId}-${userId}-${group.id}`
        )
      )
      .flat();

    // Find existing classroom offerings group enrollments
    const existingClassroomEnrollments = await strapi.entityService.findMany(
      "api::classroom-enrollment.classroom-enrollment",
      {
        filters: {
          userId: userId,
          enrollmentId: {
            $in: existingEnrollments,
          },
        },
      }
    );

    if (
      Array.isArray(existingClassroomEnrollments) &&
      existingClassroomEnrollments.length > 0
    ) {
      jsonLogs[
        `Classroom Learner enrollment Warning 1`
      ] = `User: ${userEmail} already has classroom enrollments for classroom offerings: [${existingClassroomEnrollments
        .map((enrollment) => enrollment.enrollmentId)
        .join(", ")}]`;
    }

    // Filter out existing classroom enrollments
    const newClassroomOfferingIds = classroomOfferingIds.filter(
      (classroomOfferingId) =>
        updatedGroupsResponse.every(
          (group) =>
            !existingClassroomEnrollments.some(
              ({ enrollmentId }) =>
                enrollmentId ===
                `CLE-${classroomOfferingId}-${userId}-${group.id}`
            )
        )
    );

    if (newClassroomOfferingIds.length === 0) {
      jsonLogs[
        `Classroom Learner enrollment Warning 2`
      ] = `No new classroom enrollments were created for User: ${userEmail} in classroom offering ids: [${classroomOfferingIds}]`;
      await updateJob(jobId, {
        jsonLogs,
      });

      if (!hasCourseOfferingIds) {
        await updateJob(jobId, {
          jsonLogs,
          status: jobStatuses.COMPLETED,
        });
      }
      return existingClassroomEnrollments;
    }

    const newClassroomEnrollmentPromises = newClassroomOfferingIds.map(
      (classroomOffering) => {
        const groupdId = updatedGroupsResponse.find(
          (group) =>
            group.classroomOfferings[0].id.toString() ===
            classroomOffering.toString()
        );

        return strapi.entityService.create(
          "api::classroom-enrollment.classroom-enrollment",
          {
            data: {
              userId: userId.toString(),
              userEmail,
              classroomOffering,
              role: "Learner",
              enrollmentId: `CLE-${classroomOffering}-${userId.toString()}-${
                groupdId?.id
              }`,
            },
          }
        );
      }
    );

    let classroomEnrollmentResponse = [];
    try {
      classroomEnrollmentResponse = await Promise.all(
        newClassroomEnrollmentPromises
      );
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `Classroom Learner Enrollment: Failed to create classroom enrollments for User: ${userEmail} in classroom ids: [${classroomOfferingIds}]. Errors: ${error?.message}`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new ApplicationError(
        `Classroom Learner Enrollment: Failed to create classroom enrollments for User: ${userEmail} in classroom ids: [${classroomOfferingIds}]`,
        error
      );
    }

    jsonLogs[
      `Classroom Learner Enrollments`
    ] = `Successfully created these classroom enrollments: [${classroomEnrollmentResponse
      .map((response) => response?.enrollmentId)
      .join(", ")}] for User: ${userEmail}`;

    if (!hasCourseOfferingIds) {
      await updateJob(jobId, {
        jsonLogs,
        status: jobStatuses.COMPLETED,
      });
    } else {
      await updateJob(jobId, {
        jsonLogs,
      });
    }
    return classroomEnrollmentResponse;
  }
}

module.exports = {
  enrollUserInClassroom,
  enrollAdminIntoClassroomNewGroup,
  enrollLearnerIntoClassroomExistingGroup,
};
