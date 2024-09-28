"use strict";

/**
 * A set of functions called "actions" for `scorm`
 */

module.exports = {
  handleScormPostBack: async (ctx) => {
    try {
      // call the service method handleScormPostBack from the scorm service
      return await strapi.service("api::scorm.scorm").handleScormPostBack(ctx);
    } catch (err) {
      ctx.body = err;
    }
  },
};
