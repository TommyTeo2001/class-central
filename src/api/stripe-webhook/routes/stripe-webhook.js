module.exports = {
  routes: [
    {
      method: "POST",
      path: "/stripe-webhook",
      handler: "stripe-webhook.events",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
