"use strict";

/**
 * group service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::group.group", ({ strapi }) => ({
  findGroupById(groupId) {
    return strapi.entityService.findOne("api::group.group", Number(groupId), {
      populate: {
        admins: {
          fields: ["id", "email", "firstName", "lastName"],
        },
        classroomOfferings: {
          fields: ["id", "offeringTitle"],
          populate: {
            classroom: {
              fields: ["id", "classroomTitle"],
            },
          },
        },
        learners: {
          fields: ["id", "email"],
        },
      },
    });
  },
  updateGroup(groupId, data) {
    return strapi.entityService.update("api::group.group", groupId, {
      data: data,
    });
  },
}));
