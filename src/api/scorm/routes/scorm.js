module.exports = {
  routes: [
    {
      method: "POST",
      path: "/scorm/scormPostback",
      handler: "scorm.handleScormPostBack",
      config: {
        auth: false,
      },
    },
  ],
};
