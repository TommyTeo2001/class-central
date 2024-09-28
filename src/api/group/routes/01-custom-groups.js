module.exports = {
  routes: [
    {
      method: "POST",
      path: "/group/inviteLearners",
      handler: "group.inviteLearners",
    },
    {
      method: "POST",
      path: "/group/removePendingLearners",
      handler: "group.removePendingLearners",
    },
    {
      method: "GET",
      path: "/group/convertPendingLearners",
      handler: "group.convertPendingLearners",
    },
    {
      method: "POST",
      path: "/group/convertPendingLearnersNewUsers",
      handler: "group.convertPendingLearnersNewUsers",
    },
  ],
};
