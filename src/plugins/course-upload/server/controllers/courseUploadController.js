"use strict";
// todo: Add sanitazation to the request body
module.exports = {
  async find(ctx) {
    try {
      return await strapi
        .plugin("course-upload")
        .service("courseUploadService")
        .find(ctx.query);
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async createArticulateCourse(ctx) {
    try {
      return await strapi
        .plugin("course-upload")
        .service("courseUploadService")
        .createArticulateCourse(ctx, ctx.request.files, ctx.request.body);
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async create(ctx) {
    try {
      return await strapi
        .plugin("course-upload")
        .service("courseUploadService")
        .create(ctx.request.body);
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async delete(ctx) {
    try {
      return await strapi
        .plugin("course-upload")
        .service("courseUploadService")
        .delete(ctx, ctx.params.folderName, ctx.params.id);
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};
