module.exports = (plugin) => {
  // Update user me query
  plugin.controllers.user.updateMe = async (ctx) => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return (ctx.response.body = {
        data: null,
        error: {
          status: (ctx.response.status = 401),
          name: "ValidationError",
          message: "Unathorized request to update user. Please try again.",
          details: {},
        },
      });
    }

    // Check if email taken
    const { email } = ctx.request.body;
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email: email },
      });
    if (user && user.id !== ctx.state.user.id) {
      return (ctx.response.body = {
        data: null,
        error: {
          status: (ctx.response.status = 401),
          name: "ValidationError",
          message: "Email already taken. Please try again.",
          details: {},
        },
      });
    }

    try {
      const response = await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: ctx.state.user.id },
          data: ctx.request.body,
        });
      return (ctx.response.body = {
        data: {
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
        },
      });
    } catch (error) {
      ctx.response.status = 401;
      ctx.response.body = {
        data: null,
        error: {
          status: (ctx.response.status = 401),
          name: "ValidationError",
          message: "Unathorized request to update user. Please try again.",
          details: {},
        },
      };
    }
  };

  plugin.routes["content-api"].routes.push({
    method: "PUT",
    path: "/user/me",
    handler: "user.updateMe",
    config: {
      prefix: "",
      policies: [],
    },
  });

  return plugin;
};
