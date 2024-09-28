import { request } from "@strapi/helper-plugin";

const translationRequest = {
  checkDuplicateKeyOrText: async (key, text) => {
    return await fetch(
      `/language-translations/checkDuplicateKeyOrText?key=${key}&text=${text}`,
      {
        method: "GET",
      }
    );
  },
  addTranslation: async (translationsToBeAdded) => {
    return await fetch("/language-translations/addTranslation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        translationsToBeAdded,
      }),
    });
  },
};

export default translationRequest;
