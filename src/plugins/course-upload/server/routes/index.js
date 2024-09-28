module.exports = [
  {
    method: "GET",
    path: "/find",
    handler: "courseUploadController.find",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/createArticulateCourse",
    handler: "courseUploadController.createArticulateCourse",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/create",
    handler: "courseUploadController.create",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "DELETE",
    path: "/delete/:folderName/:id",
    handler: "courseUploadController.delete",
    config: {
      policies: [],
      auth: false,
    },
  },
];
