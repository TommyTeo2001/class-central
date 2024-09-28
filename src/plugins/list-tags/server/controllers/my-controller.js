'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('list-tags')
      .service('myService')
      .getWelcomeMessage();
  },
});
