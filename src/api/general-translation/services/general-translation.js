'use strict';

/**
 * general-translation service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::general-translation.general-translation');
