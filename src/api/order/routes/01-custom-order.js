module.exports = {
  routes: [
    {
      // Path defined to find orders by the latest session id
      method: "GET",
      path: "/orderBySessionId/:sessionId",
      handler: "order.findOrderBySessionId",
    },
  ],
};
