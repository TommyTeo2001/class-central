const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;
var _ = require("lodash");

module.exports = {
  async beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    // UI creation of Classroom Enrollment record
    const isValidEnrollmentRecordUI =
      data.courseOffering && data.userId && data.userEmail;
    if (!isValidEnrollmentRecordUI) {
      throw new ApplicationError(
        "Course Enrollment record cannot be created with an empty Course Offering , userId and /or userEmail field",
        400
      );
    }

    // Admin creation of course Enrollment record
    if (Array.isArray(data?.courseOffering?.connect)) {
      const isValidEnrollmentRecordAdmin =
        !!data?.courseOffering?.connect.length > 0 &&
        !!data?.userId &&
        !!data?.userEmail;
      if (!isValidEnrollmentRecordAdmin) {
        throw new ApplicationError(
          "Course Enrollment record cannot be created with an empty Course Offering, userId and /or userEmail field",
          400
        );
      }
    }

    const courseOfferingId = data?.courseOffering?.connect
      ? data?.courseOffering?.connect[0]?.id
      : data?.courseOffering;
    const userId = data?.userId;
    const courseOffering = await strapi.entityService.findOne(
      "api::course-offering.course-offering",
      courseOfferingId
    );
    event.params.data.enrollmentId = `CE-${courseOffering.id}-${userId}`;
  },
  async beforeUpdate(event) {},
  async afterUpdate(event) {
    const { data, where, select, populate } = event.params;
    const enrollmentRecordId = where?.id;
    /**
     * Check if one or more course enrollments (related to a classroom) is completed,
     * if so, update the classroom enrollment record
     */
    if (
      (data?.enrollmentLifecycle === "Completed" ||
        data?.enrollmentLifecycle === "In Progress") &&
      enrollmentRecordId
    ) {
      // Check if course has a related classroom
      const response = await strapi.entityService.findOne(
        "api::course-enrollment.course-enrollment",
        enrollmentRecordId,
        {
          populate: {
            classroomEnrollment: {
              populate: { courseEnrollments: true },
            },
          },
        }
      );
      // If course has a related classroom, check if all course enrollments related to the classroom are completed
      if (response?.classroomEnrollment.length > 0) {
        const classroomEnrollments = response?.classroomEnrollment;
        const classroomsToUpdate = [];
        classroomEnrollments.reduce((acc, curr) => {
          const courseEnrollments = curr.courseEnrollments;
          let enrollmentLifecycle = "In Progress";
          // if all enrollments are completed, set the classroom lifecycle to completed
          if (
            courseEnrollments.every(
              (courseEnrollment) =>
                courseEnrollment.enrollmentLifecycle === "Completed" ||
                !!courseEnrollment.dateCompleted
            )
          ) {
            enrollmentLifecycle = "Completed";
            classroomsToUpdate.push({
              id: curr.id,
              dateCompleted: new Date().toISOString().split("T")[0],
              enrollmentLifecycle,
            });
          } else {
            classroomsToUpdate.push({
              id: curr.id,
              enrollmentLifecycle,
            });
          }
        }, []);

        const updateClassroomPromies = classroomsToUpdate.map(
          ({ id, dateCompleted, enrollmentLifecycle }) =>
            strapi.entityService.update(
              "api::classroom-enrollment.classroom-enrollment",
              id,
              {
                data: {
                  completionDate: dateCompleted,
                  enrollmentLifecycle,
                },
              }
            )
        );
        const finalResponse = await Promise.all(updateClassroomPromies);
      }
    }
  },
};
