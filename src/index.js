"use strict";

const { filter } = require("lodash");
const { pop } = require("../config/middlewares");
const { Query } = require("pg");
const classroomEnrollment = require("./api/classroom-enrollment/controllers/classroom-enrollment");
const instructor = require("./api/instructor/controllers/instructor");
const { create } = require("lodash/fp");
const { captureSentryError } = require("./utils/sentryUtil");
const {
  addFirstLastNamesToUserCollection,
} = require("./utils/graphql/customSettings");
const {
  findCourseOfferingBySlug,
} = require("./utils/graphql/courseOfferingCollection");
const { findClassroomBySlug } = require("./utils/graphql/classroomCollection");
const {
  findClassroomEnorllmentsByEmailAndEnrollmentId,
} = require("./utils/graphql/classroomEnrollmentCollection");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const extensionService = strapi.plugin("graphql").service("extension");
    // Define firstName and lastName fields to the UsersPermissionsMe type
    addFirstLastNamesToUserCollection(extensionService);

    // Custom query for fetching course offerings by course slug
    findCourseOfferingBySlug(extensionService);

    // Custom query for fetching a classroom and it's classroom offerings
    findClassroomBySlug(extensionService);

    // Custom query for fetching classroom enrollment records by user email and enrollmentId
    findClassroomEnorllmentsByEmailAndEnrollmentId(extensionService);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {
    // strapi.db.lifecycles.subscribe({
    //   models: ["plugin::course-upload.courseupload"],
    //   async afterCreate(event) {
    //     // const {
    //     //   data: { courseUploadUrl, courseId },
    //     // } = event.params;
    //     // if (!!courseUploadUrl) {
    //     //   const response = await strapi.services["api::course.course"].update(
    //     //     courseId,
    //     //     { data: { courseUrl: courseUploadUrl } }
    //     //   );
    //     // }
    //   },
    //   // Remove courseUrl from course model after course upload is deleted
    //   async afterDelete(event) {
    //     // const { courseId } = event?.result;
    //     // if (!!courseId) {
    //     //   const response = await strapi.services["api::course.course"].update(
    //     //     courseId,
    //     //     { data: { courseUrl: null } }
    //     //   );
    //     // }
    //   },
    // });
  },
};
