module.exports = {
  routes: [
    {
      // Path defined to find orders by the latest session id
      method: "POST",
      path: "/createEnrollments",
      handler: "course-enrollment.createEnrollments",
    },
  ],
};
