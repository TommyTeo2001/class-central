'use strict';

/**
 * feature-flag router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::feature-flag.feature-flag');
