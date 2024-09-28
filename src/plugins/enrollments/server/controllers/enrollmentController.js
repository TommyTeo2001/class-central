"use strict";

module.exports = {
  async findUsers(ctx) {
    try {
      return await strapi
        .plugin("enrollments")
        .service("enrollmentService")
        .findUsers(ctx);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async enrollAllUsers(ctx) {
    try {
      return await strapi
        .plugin("enrollments")
        .service("enrollmentService")
        .enrollAllUsers(ctx);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async findJobsByIds(ctx) {
    try {
      return await strapi
        .plugin("enrollments")
        .service("enrollmentService")
        .findJobsByIds(ctx);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async findAllCourseOfferings(ctx) {
    try {
      return await strapi
        .plugin("enrollments")
        .service("enrollmentService")
        .findAllCourseOfferings(ctx);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
