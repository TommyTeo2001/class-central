"use strict";

/**
 * course-enrollment service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::course-enrollment.course-enrollment",
  ({ strapi }) => ({
    updateEnrollmentRecordId(enrollments, source) {
      source.forEach(({ enrollmentId, id: enrollmentRecordId }) => {
        const enrollment = enrollments.find(
          (enrollment) => enrollment.courseEnrollmentId === enrollmentId
        );
        if (enrollment) {
          enrollment.enrollmentRecordId = enrollmentRecordId;
        }
      });
    },
  })
);
