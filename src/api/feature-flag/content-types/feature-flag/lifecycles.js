var _ = require("lodash");
const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;
const { captureSentryError } = require("../../../../utils/sentryUtil");

module.exports = {
  beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    event.params.data.uniqueFeatureName = _.kebabCase(data.featureName);
  },
  async beforeUpdate(event) {
    const { data, where, select, populate } = event.params;
    event.params.data.uniqueFeatureName = _.kebabCase(data.featureName);
  },
};
