'use strict';

/**
 * classroom-enrollment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::classroom-enrollment.classroom-enrollment');
