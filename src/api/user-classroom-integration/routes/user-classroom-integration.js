module.exports = {
  routes: [
    {
      method: "POST",
      path: "/user-classroom-integration",
      handler: "user-classroom-integration.createUserAndEnrollInClassroom",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
