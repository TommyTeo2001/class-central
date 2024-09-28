module.exports = [
  {
    method: "GET",
    path: "/users",
    handler: "enrollmentController.findUsers",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/enrollAllUsers",
    handler: "enrollmentController.enrollAllUsers",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/jobByIds",
    handler: "enrollmentController.findJobsByIds",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/allCourseOfferings",
    handler: "enrollmentController.findAllCourseOfferings",
    config: {
      policies: [],
      auth: false,
    },
  },
];
