"use strict";
const qs = require("qs");

module.exports = ({ strapi }) => ({
  async findCheckDuplicateKeyOrText(ctx) {
    const { key, text } = ctx.request.query;
    try {
      const repsonse = await fetch(
        `${process.env.STRAPI_PRODUCTION_URL}/api/general-translations?filters[$or][0][key][$eq]=${key}&filters[$or][1][text][$eq]=${text}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // TODO: Store this in the .env file
            // Authorization: `Bearer ${process.env.STRAPI_LOGIN_JWT_TOKEN}`,
          },
        }
      );
      const data = await repsonse.json();

      if (!!data?.data && data?.data.length > 0) {
        const { data: dataArray } = data;

        let keyFound = {};
        let textFound = {};
        // find duplicate key or text in the data array
        dataArray.forEach((element) => {
          if (element.attributes.key === key) {
            keyFound = element;
          } else if (element.attributes.text === text) {
            textFound = element;
          }
        });

        return {
          message: "Duplicate key or text found!",
          keyFound,
          textFound,
          status: 200,
        };
      }

      if (!!data?.error) {
        return {
          error:
            "Error checking duplicate key or text failed. Please contact admin",
          keyFound: {},
          textFound: {},
          status: 500,
        };
      }

      return {
        message: "No duplicate key or text found!",
        keyFound: {},
        textFound: {},
        status: 200,
      };
    } catch (error) {
      return {
        error: `Error checking duplicate key or text failed. Contact admin. Error: ${error.message}`,
        keyFound: {},
        textFound: {},
        status: 500,
      };
    }
  },
  async addTranslation(ctx) {
    const { translationsToBeAdded } = ctx.request.body;
    try {
      let productionResponse = await Promise.all(
        translationsToBeAdded.map(async (translation) => {
          const response = await fetch(
            `${process.env.STRAPI_PRODUCTION_URL}/api/general-translations`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_PRODUCTION_JWT}`,
              },
              body: JSON.stringify({
                data: {
                  text: translation.text,
                  key: translation.key,
                  page: translation.page,
                  description: translation.description,
                },
              }),
            }
          );
          return response.json();
        })
      );

      if (
        productionResponse.map((response) => !!response?.error).includes(true)
      ) {
        let errors = productionResponse
          .map((response) => response?.error?.message)
          .filter(Boolean);

        return {
          error: `Error adding translations to production. Errors: ${errors.join(
            ", "
          )}`,
          status: 500,
        };
      }

      // If there are no errors, add them to our database
      let createdLocalTranslationsReponse = [];
      const allLocalTranslations = await Promise.all(
        translationsToBeAdded.map((translation) =>
          strapi.entityService.create(
            "api::general-translation.general-translation",
            {
              data: {
                text: translation.text,
                key: translation.key,
                page: translation.page,
                description: translation.description,
              },
            }
          )
        )
      );

      return {
        message: "Translation added successfully!",
        status: 200,
      };
    } catch (error) {
      return {
        error: `Error adding translations failed. Contact admin. Error: ${error.message}`,
        status: 500,
      };
    }
  },
});
