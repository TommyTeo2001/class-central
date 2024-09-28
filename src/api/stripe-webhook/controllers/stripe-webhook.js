"use strict";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});
const {
  captureSentryError,
  captureSentryErrorAndThrowApplicationError,
} = require("../../../utils/sentryUtil");
const { createCustomer } = require("../../../utils/stripeUtil");

/**
 * Stripe webhook to handle events from Stripe `stripe-webhook`
 * TODO: TO BE USED LATER! I have decided to fetch order session status when users requests for it
 */

module.exports = {
  events: async (ctx, next) => {
    // TODO: TO BE USED LATER!
    return;
    const sig = ctx.request.headers["stripe-signature"];
    const raw = ctx.request.body?.[Symbol.for("unparsedBody")];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        raw,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      ctx.body = err;
      captureSentryErrorAndThrowApplicationError(
        `There was an error constructing stripe webhook event: ${error.message}`
      );
    }
    const { id: eventId, metadata } = event?.data?.object;

    // Handle the event
    switch (event?.type) {
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        const {
          object: completedObject,
          payment_status,
          customer_details,
          customer,
          payment_intent,
          expires_at,
        } = checkoutSessionCompleted;
        if (
          completedObject === "checkout.session" &&
          Object.keys(metadata).length > 0 &&
          payment_status === "paid"
        ) {
          const { orderId } = metadata;
          try {
            // Update stripe order status in our database
            await strapi
              .service("api::stripe-webhook.stripe-webhook")
              .handleStripeOrderUpdate(
                orderId,
                payment_status,
                checkoutSessionCompleted,
                payment_intent,
                expires_at
              );
            // Handle a customer info in stripe's database
            await strapi
              .service("api::stripe-webhook.stripe-webhook")
              .handleStripeCustomerUpdate({
                id: customer,
                name: customer_details?.name || "",
                email: customer_details?.email,
                phone: customer_details?.phone || "",
              });
          } catch (error) {
            captureSentryErrorAndThrowApplicationError(
              `There was an error updating the order status from webhook event: ${eventId} for orderId ${orderId}. Error: ${error.message}`
            );
          }
        }
        break;
      default:
    }
    // return 200 status to stripe
    ctx.status = 200;
  },
};
