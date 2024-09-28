var _ = require("lodash");
const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;

module.exports = {
  async beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    const { key, locale, text } = data;

    if (key) {
      const duplicateKey = await strapi.entityService.findMany(
        "api::general-translation.general-translation",
        {
          filters: {
            $or: [{ key }],
          },
          locale,
        }
      );

      if (duplicateKey.length > 0) {
        throw new ApplicationError(
          `This key [${key}] already exists for the '${locale}' locale`
        );
      }
    }

    if (text) {
      const duplicateText = await strapi.entityService.findMany(
        "api::general-translation.general-translation",
        {
          filters: {
            $or: [{ text }],
          },
          locale,
        }
      );

      if (duplicateText.length > 0) {
        throw new ApplicationError(
          `This text [${text}] already exists for the '${locale}' locale`
        );
      }
    }
  },
  async beforeUpdate(event) {
    const { data, where, select, populate } = event.params;
    const translation = await strapi.entityService.findOne(
      "api::general-translation.general-translation",
      where.id,
      {
        fields: ["key", "locale", "text"],
      }
    );

    const { locale } = translation;
    const { key: newKey, text: newText } = data;

    if (!!newKey && newKey !== translation.key) {
      const duplicateKey = await strapi.entityService.findMany(
        "api::general-translation.general-translation",
        {
          filters: {
            $or: [{ key: newKey }],
          },
          locale,
        }
      );

      if (duplicateKey.length > 0) {
        throw new ApplicationError(
          `This key [${newKey}] already exists for the '${locale}' locale`
        );
      }
    }

    if (!!newText && newText !== translation.text) {
      const duplicateText = await strapi.entityService.findMany(
        "api::general-translation.general-translation",
        {
          filters: {
            $or: [{ text: newText }],
          },
          locale,
        }
      );

      if (duplicateText.length > 0) {
        throw new ApplicationError(
          `This text [${newText}] already exists for the '${locale}' locale`
        );
      }
    }
  },
};
