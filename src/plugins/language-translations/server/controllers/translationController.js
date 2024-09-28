"use strict";

module.exports = {
  async findCheckDuplicateKeyOrText(ctx) {
    try {
      return await strapi
        .plugin("language-translations")
        .service("translationService")
        .findCheckDuplicateKeyOrText(ctx);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async addTranslation(ctx) {
    try {
      return await strapi
        .plugin("language-translations")
        .service("translationService")
        .addTranslation(ctx);
    } catch (error) {
      ctx.throw(500, error);
    }
  }
};
