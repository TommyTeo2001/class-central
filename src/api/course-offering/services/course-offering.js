'use strict';

/**
 * course-offering service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::course-offering.course-offering');
