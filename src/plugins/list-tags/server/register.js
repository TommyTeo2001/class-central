"use strict";

module.exports = ({ strapi }) => {
  // register phase
  strapi.customFields.register({
    name: "listTags",
    plugin: "list-tags",
    type: "json",
    inputSize: {
      default: 12,
      isResizable: true,
    },
  });
};
