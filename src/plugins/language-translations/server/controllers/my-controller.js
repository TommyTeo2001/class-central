'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('language-translations')
      .service('myService')
      .getWelcomeMessage();
  },
});
