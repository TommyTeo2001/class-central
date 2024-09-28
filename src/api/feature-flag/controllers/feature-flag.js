'use strict';

/**
 * feature-flag controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::feature-flag.feature-flag');
