'use strict';

/**
 * feature-flag service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::feature-flag.feature-flag');
