// const config = {
//   locales: [
// 'ar',
// 'fr',
// 'cs',
// 'de',
// 'dk',
// 'es',
// 'he',
// 'id',
// 'it',
// 'ja',
// 'ko',
// 'ms',
// 'nl',
// 'no',
// 'pl',
// 'pt-BR',
// 'pt',
// 'ru',
// 'sk',
// 'sv',
// 'th',
// 'tr',
// 'uk',
// 'vi',
// 'zh-Hans',
// 'zh',
// ],
// };

// const bootstrap = (app) => {
//   console.log(app);
// };

// export default {
//   config,
//   bootstrap,
// };

import logo from "./extensions/favicon.png";

const config = {
  auth: {
    logo,
  },
  head: {
    favicon: logo,
  },
  menu: {
    logo,
  },
  // Extend the translations
  translations: {
    en: {
      "app.components.LeftMenu.navbrand.title": "Dashboard",

      "app.components.LeftMenu.navbrand.workplace": "Fuller Equip",

      "Auth.form.welcome.title": "Fuller Equip Dashboard",

      "Auth.form.welcome.subtitle": "Login to your account",

      "Settings.profile.form.section.experience.interfaceLanguageHelp":
        "Preference changes will apply only to you.",
    },
  },
  // Disable video tutorials
  tutorials: false,
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};
