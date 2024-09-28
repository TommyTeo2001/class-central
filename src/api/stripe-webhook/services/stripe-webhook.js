"use strict";
const {
  createCustomer,
  retrieveCustomer,
  updateCustomer,
  stripeChargeList,
} = require("../../../utils/stripeUtil");

/**
 * stripe-webhook service
 */
module.exports = () => ({
  /**
   *  Handle stripe order update by updating the order in the database
   * @param {string} orderId
   * @param {string} paymentStatus
   * @param {json} responseMessage
   * @param {string} payment_intent
   */
  async handleStripeOrderUpdate(
    orderId,
    paymentStatus,
    responseMessage,
    payment_intent,
    expires_at
  ) {
    // If payment_intent is provided, retrieve the charge from Stripe
    if (payment_intent) {
      const charge = await stripeChargeList({ payment_intent });
      // Since payment_intent is unique, we can assume that the charge is the first element
    }
    await strapi.entityService.update("api::order.order", orderId, {
      data: {
        paymentStatus,
        responseMessage,
        paymentIntent: payment_intent,
        checkoutSessionExpiration: new Date(expires_at),
      },
    });
  },
  /**
   *  Update the customer in Stripe
   * @param {object} data
   */
  async handleStripeCustomerUpdate(data) {
    const { id, name, email, phone } = data;
    await updateCustomer(id, { name, email, phone });
  },
});
