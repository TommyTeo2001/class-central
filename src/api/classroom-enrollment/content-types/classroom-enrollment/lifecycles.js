var _ = require("lodash");
const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;

module.exports = {
  async beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    // UI creation of Classroom Enrollment record
    const isValidEnrollmentRecordUI =
      !!data.classroomOffering && !!data.userId && !!data.userEmail;
    if (!isValidEnrollmentRecordUI) {
      throw new ApplicationError(
        "Classroom Enrollment record cannot be created with an empty Classroom Offering, userId and /or userEmail field*",
        400
      );
    }
    // Admin creation of Classroom Enrollment record
    if (Array.isArray(data?.classroomOffering?.connect)) {
      const isValidEnrollmentRecordAdmin =
        !!data?.classroomOffering?.connect.length > 0 &&
        !!data?.userId &&
        !!data?.userEmail;
      if (!isValidEnrollmentRecordAdmin) {
        throw new ApplicationError(
          "Classroom Enrollment record cannot be created with an empty Classroom Offering, userId and /or userEmail field**",
          400
        );
      }
    }
    // const classroomOfferingId = data?.classroomOffering?.connect
    //   ? data?.classroomOffering?.connect[0]?.id
    //   : data?.classroomOffering;
    // const userId = data?.userId;
    // const classroomOffering = await strapi.entityService.findOne(
    //   "api::classroom-offering.classroom-offering",
    //   classroomOfferingId
    // );
    // event.params.data.enrollmentId = `CLE-${classroomOffering.id}-${userId}`;
  },
  async beforeUpdate(event) {
    //
  },
};
