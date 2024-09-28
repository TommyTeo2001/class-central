const { captureSentryError } = require("../sentryUtil");
/**
 * job to update course enrollments by copying the user ID and email from relation field to text fields
 */
async function updateEnrollments() {
  try {
    const allEnrollments = await strapi.entityService.findMany(
      "api::course-enrollment.course-enrollment",
      {
        filters: {
          userEmail: {
            $null: true,
          },
        },
        populate: { user: true },
      }
    );
    // For each enrollment record, get the enrollment ID, user ID and email
    const batchSize = 50;
    let batch = allEnrollments.splice(0, batchSize);
    let counter = 0;
    const enrollUpdatesPromises = [];
    batch.forEach((element) => {
      const { id, user } = element;
      if (!user) return;
      const { id: userId, email } = user;
      enrollUpdatesPromises.push(
        strapi.entityService.update(
          "api::course-enrollment.course-enrollment",
          id,
          {
            data: {
              userId: userId.toString(),
              userEmail: email,
            },
          }
        )
      );
    });
    await Promise.all(enrollUpdatesPromises);
    console.log("Running cron job to update enrollments", new Date());
  } catch (error) {
    console.log("error::", error);
    captureSentryError(error);
  }
}
/**
 * job to update classroom enrollments by copying the user ID and email from relation field to text fields
 */
async function updateClassroomEnrollments() {
  try {
    const allEnrollments = await strapi.entityService.findMany(
      "api::classroom-enrollment.classroom-enrollment",
      {
        filters: {
          userEmail: {
            $null: true,
          },
        },
        populate: { user: true },
      }
    );
    // For each classroom enrollment record, get the enrollment ID, user ID and email
    const batchSize = 20;
    let batch = allEnrollments.splice(0, batchSize);
    let counter = 0;
    const enrollUpdatesPromises = [];
    batch.forEach((element) => {
      const { id, user } = element;
      if (!user) return;
      const { id: userId, email } = user;
      enrollUpdatesPromises.push(
        strapi.entityService.update(
          "api::classroom-enrollment.classroom-enrollment",
          id,
          {
            data: {
              userId: userId.toString(),
              userEmail: email,
            },
          }
        )
      );
    });
    await Promise.all(enrollUpdatesPromises);
  } catch (error) {
    console.log("error::", error);
    captureSentryError(error);
  }
}

/**
 * job to update classroom course enrollment field from OneToMany to ManyToMany. We first need to create a new field to copy values from the existing field
 *
 */
async function copyCourseEnrollToTempField() {
  try {
    const allClassroomEnrollments = await strapi.entityService.findMany(
      "api::classroom-enrollment.classroom-enrollment",
      {
        populate: { courseEnrollments: true, courseEnrollmentsTemp: true },
      }
    );
    const batchSize = 20;
    let batch = allClassroomEnrollments.splice(0, batchSize);
    const enrollUpdatesPromises = [];
    while (batch.length > 0) {
      batch.forEach((element) => {
        const { id, courseEnrollments, courseEnrollmentsTemp } = element;
        if (courseEnrollments.length === 0) {
          console.log(`courseEnrollments don't exist for ${id}::`);
          return;
        }
        if (courseEnrollmentsTemp.length > 0) {
          console.log(`courseEnrollmentsTemp already exist for ${id}`);
          return;
        }
        const courseEnrollmentsIds = courseEnrollments.map(
          (enroll) => enroll.id
        );
        console.log(
          `courseEnrollmentsIds to be added for ${id}:: enrollment Ids:: ${courseEnrollmentsIds}`
        );
        enrollUpdatesPromises.push(
          strapi.entityService.update(
            "api::classroom-enrollment.classroom-enrollment",
            id,
            {
              data: {
                courseEnrollmentsTemp: courseEnrollmentsIds,
              },
            }
          )
        );
      });
      batch = allClassroomEnrollments.splice(0, batchSize);
    }
    await Promise.all(enrollUpdatesPromises);
  } catch (error) {
    console.log("error from copyCourseEnrollToTempField::", error);
    captureSentryError(error);
  }
}

/**
 * job to update classroom course enrollment field from OneToMany to ManyToMany. Secondaly we need to change the field type from OneToMany to ManyToMany and copy values from the temp field to the new field
 */
async function copyCourseEnrollFromTempFieldBackToOrginal() {
  try {
    const allClassroomEnrollments = await strapi.entityService.findMany(
      "api::classroom-enrollment.classroom-enrollment",
      {
        populate: { courseEnrollments: true, courseEnrollmentsTemp: true },
      }
    );
    const batchSize = 20;
    let batch = allClassroomEnrollments.splice(0, batchSize);
    const enrollUpdatesPromises = [];
    while (batch.length > 0) {
      batch.forEach((element) => {
        const { id, courseEnrollments, courseEnrollmentsTemp } = element;
        if (courseEnrollments.length > 0) {
          console.log(`courseEnrollments didn't get updated for ${id}::`);
          return;
        }
        if (courseEnrollmentsTemp.length === 0) {
          console.log(
            `courseEnrollmentsTemp doesn't exist for ${id}, no need to update.`
          );
          return;
        }
        const courseEnrollmentsTempIds = courseEnrollmentsTemp.map(
          (enroll) => enroll.id
        );
        console.log(
          `courseEnrollmentsTempIds to be added for ${id}:: enrollment Ids:: ${courseEnrollmentsTempIds}`
        );
        enrollUpdatesPromises.push(
          strapi.entityService.update(
            "api::classroom-enrollment.classroom-enrollment",
            id,
            {
              data: {
                courseEnrollments: courseEnrollmentsTempIds,
              },
            }
          )
        );
      });
      batch = allClassroomEnrollments.splice(0, batchSize);
    }
    await Promise.all(enrollUpdatesPromises);
  } catch (error) {
    console.log("error from updateClassroomCourseEnrollments::", error);
    captureSentryError(error);
  }
}

module.exports = {
  updateEnrollments,
  updateClassroomEnrollments,
  copyCourseEnrollToTempField,
  copyCourseEnrollFromTempFieldBackToOrginal,
}; // courseEnrollments, classroomEnrollment
