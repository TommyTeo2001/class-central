module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/user-confirmation',
      handler: 'user-confirmation.confirmRoleChange',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/change-role',
      handler: 'user-confirmation.changeUserRole',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
