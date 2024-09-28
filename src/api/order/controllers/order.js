"use strict";
const { createStripeCheckoutSession } = require("../../../utils/stripeUtil");
const { createCustomer } = require("../../../utils/stripeUtil");
const {
  retrieveStrpieCheckoutSession,
  stripeChargeList,
  retrieveInvoice,
} = require("../../../utils/stripeUtil");
const {
  updateJob,
  createJob,
  jobStatuses,
  retrieveJobById,
} = require("../../../utils/jobsUtil");
const {
  captureSentryErrorAndSetJobStatusToFailed,
  captureSentryError,
} = require("../../../utils/sentryUtil");

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
// TODO: Move some of these methods to a service
module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  /**
   * Create an order.
   * @param {Object} ctx
   * @return {Promise}
   * @description Create an order in the database and create a checkout session with Stripe for that order
   * @example POST /orders
   */
  async create(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const sanitizedBody = await this.sanitizeInput(ctx.request.body);
    const {
      id: customerId,
      email: customerEmail,
      firstName,
      lastName,
    } = ctx.state.user;
    const { products } = sanitizedBody;

    if (!products) {
      return ctx.badRequest(
        `Products are required for order creation. CustomerEmail: ${customerEmail}`
      );
    }

    let parsedProducts = [];
    try {
      parsedProducts = JSON.parse(products);
    } catch (error) {
      return ctx.badRequest(
        `Product Ids coming from the checkout page must be a valid JSON string. Products: ${products}, CustomerEmail: ${customerEmail}`
      );
    }

    const couresproductIds = [];
    const classroomOfferingIds = [];
    parsedProducts.map((product) => {
      if (product.productType === "classroomOffering") {
        classroomOfferingIds.push(product.classroomOfferingId);
      }
      if (product.productType === "course") {
        couresproductIds.push(product.productId);
      }
    });

    // TODO: Add this to a service
    // Finds course offerings and filter them by the productIds
    const courseOfferings = await strapi.entityService.findMany(
      "api::course-offering.course-offering",
      {
        filters: { stripeProductId: { $in: couresproductIds } },
      }
    );

    // Find classrooms and filter by classroomOfferingIds
    // ! Here, we will associate an order item with classroom offerings but each Classroom associated with each classroom offering will have a Stripe product attached to it.
    const classrooms = await strapi.entityService.findMany(
      "api::classroom.classroom",
      {
        filters: {
          classroomOfferings: {
            id: {
              $in: classroomOfferingIds,
            },
          },
        },
        populate: {
          classroomOfferings: {
            fields: ["id"],
          },
        },
      }
    );

    let jobDescription = `Create Stripe payment for userEmail: ${customerEmail}. Course Offering Ids: [${courseOfferings.map(
      (courseOffering) => courseOffering.id
    )}] and classroom Offering Ids: [${classroomOfferingIds}]`;

    const jsonLogs = {};
    const { id: jobId } = await createJob(jobDescription, {});

    if (!jobId) {
      await captureSentryError(
        new Error(
          `There was an error creating a job for the order: ${orderId} for the customer: ${customerEmail}`
        )
      );
      return ctx.badRequest(
        `There was an error creating a job for the order: ${orderId} for the customer: ${customerEmail}`
      );
    }

    if (
      (!Array.isArray(courseOfferings) || courseOfferings.length === 0) &&
      (!Array.isArray(classrooms) || classrooms.length === 0)
    ) {
      jsonLogs[
        "Failed"
      ] = `There were no course Offerings or classrooms found to purchase: for CustomerEmail: ${customerEmail}`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.badRequest(
        `There were no course Offerings or classrooms found to purchase products: ${JSON.stringify(
          parsedProducts
        )} for CustomerEmail: ${customerEmail}`
      );
    }

    let createOrderResponse = null;
    const courseOfferingIds =
      courseOfferings.map((courseOffering) => courseOffering.id) || [];

    const IdsOfclassroomOffering = classroomOfferingIds || [];

    // TODO: Add this to a service
    // Create an order in our database
    try {
      createOrderResponse = await strapi.entityService.create(
        "api::order.order",
        {
          data: {
            courseOfferings: {
              connect: courseOfferingIds,
            },
            classroomOfferings: {
              connect: IdsOfclassroomOffering,
            },
            customerEmail,
            customerId: customerId.toString(),
          },
        }
      );
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `There was an error creating an order for the customer: ${customerEmail}. Error: ${error.message}`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.badRequest(
        `There was an error creating an order for the customer: ${customerEmail}. Error: ${error.message}`
      );
    }

    const { id: orderId } = createOrderResponse;
    jobDescription = `Create Stripe payment for userEmail: ${customerEmail} with order Id: ${orderId}. Course Offering Ids: [${courseOfferingIds}] and Classroom Offering Ids: [${IdsOfclassroomOffering}]`;
    jsonLogs["Step 1"] = `Order created successfully.`;

    await updateJob(jobId, {
      status: jobStatuses.RUNNING,
      description: jobDescription,
      jsonLogs,
    });

    // TODO: Add this to a service
    // create a new customer in Stripe but first check if a customer already exists in our database
    let existingCustomerId = "";
    try {
      const existingCustomer = await strapi.entityService.findMany(
        "api::order.order",
        {
          fields: ["customerId", "stripeCustomerId"],
          filters: {
            customerEmail: customerEmail,
            stripeCustomerId: {
              $notNull: true,
            },
          },
          start: 0,
          limit: 1,
        }
      );

      existingCustomerId = existingCustomer?.[0]?.stripeCustomerId;

      if (!existingCustomerId) {
        const customerName = `${firstName || ""} ${lastName || ""}`.trim();
        const customer = await createCustomer({
          email: customerEmail,
          name: customerName,
        });
        existingCustomerId = customer.id;
      }
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `There was an error creating/finding an existing customer in our database for: ${customerEmail}. Error: ${error.message}`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.badRequest(
        `There was an error creating/finding an existing customer in our database for: ${customerEmail}. Error: ${error.message}`
      );
    }

    // Build line items from courseOfferings and classrooms offering
    let lineItems = [];
    let allTitles = "";
    if (courseOfferings && courseOfferings.length > 0) {
      courseOfferings.map((courseOffering) => {
        allTitles += `${courseOffering.offeringTitle}, `;
        lineItems.push({
          price: courseOffering.stripePriceId,
          quantity: getQuantityOfCourseOffering(courseOffering, parsedProducts),
        });
      });
    }
    if (classrooms && classrooms.length > 0) {
      classrooms.map((classroom) => {
        allTitles += `${classroom.classroomTitle}, `;
        lineItems.push({
          price: classroom.stripePriceId,
          quantity: getQuantityOfClassroomOffering(classroom, parsedProducts),
        });
      });
    }
    // Remove comma from the end of the string
    allTitles = allTitles.replace(/,\s*$/, "");

    // TODO: Add this to a service
    // Create a checkout session with Stripe
    let session = null;
    try {
      session = await createStripeCheckoutSession(
        {
          line_items: lineItems,
          invoice_creation: {
            enabled: true,
          },
          allow_promotion_codes: true,
          mode: "payment",
          customer: existingCustomerId,
          ui_mode: "embedded",
          payment_intent_data: {
            description: allTitles,
          },
          saved_payment_method_options: {
            payment_method_save: "enabled",
          },
          return_url: `http://localhost:3000/checkout/paymentConfirmation/{CHECKOUT_SESSION_ID}/${jobId}`,
        },
        lineItems
      );
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `There was an error creating the checkout session for the customer: ${customerEmail}. Error: ${JSON.stringify(
        error
      )}`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.badRequest(
        `There was an error creating the checkout session for the customer: ${customerEmail}. Error: ${JSON.stringify(
          error
        )}`
      );
    }
    if (!session) {
      jsonLogs[
        "Failed"
      ] = `There was an error creating the checkout session for the customer: ${customerEmail}. Session was not created`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.badRequest(
        `There was an error creating the checkout session for the customer: ${customerEmail}. Session was not created`
      );
    }

    jsonLogs[
      "Step 2"
    ] = `Checkout session from Stripe was created successfully.`;
    await updateJob(jobId, { jsonLogs });

    // TODO: Add this to a service
    // Update the initially created order with the checkout session data
    try {
      const updateOrderResponse = await strapi.entityService.update(
        "api::order.order",
        orderId,
        {
          data: {
            price: (session?.amount_total / 100).toFixed(2),
            checkoutSessionId: session.id,
            checkoutClientSecret: session.client_secret,
            paymentStatus: session.payment_status,
            responseMessage: session,
            stripeCustomerId: existingCustomerId,
            paymentIntent: session.payment_intent,
          },
        }
      );
      const { id } = updateOrderResponse;
      return { orderId: id, clientSecret: session.client_secret };
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `There was an error updating an order in our database. Error: ${error.message}`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.badRequest(
        `There was an error updating an order in our database. Error: ${error.message}`
      );
    }
  },

  /**
   * Find orders for a customer
   * @param {Object} ctx
   * @returns {Promise}
   * @description Find orders for a customer
   * @example GET /orders
   * @example GET /orders?_sort=created_at:desc&populate[0]=courseOfferings&populate[1]=classrooms
   */
  async find(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { id: userId } = ctx.state.user;
    sanitizedQueryParams.filters = {
      ...sanitizedQueryParams.filters,
      customerId: userId,
    };
    sanitizedQueryParams.populate = ["courseOfferings", "classroomOfferings"];
    const { results, pagination } = await strapi
      .service("api::order.order")
      .find(sanitizedQueryParams);

    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults, { pagination });
  },

  /**
   * Find order by id
   * @param {Object} ctx
   * @returns {Promise}
   * @description Find order by id
   * @example GET /orders/1
   */
  async findOne(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { id } = ctx.params;
    const result = await strapi
      .service("api::order.order")
      .findOne(id, sanitizedQueryParams);

    if (!result) {
      return this.notFound();
    }

    const sanitizedResult = await this.sanitizeOutput(result, ctx);

    return this.transformResponse(sanitizedResult);
  },

  /**
   * Find order by session id
   */
  async findOrderBySessionId(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { sessionId } = ctx.params;
    const { jobId } = ctx.query;
    const { id: userId, email } = ctx.state.user;
    sanitizedQueryParams.filters = {
      ...sanitizedQueryParams.filters,
      customerId: userId,
      checkoutSessionId: sessionId,
    };
    if (!sessionId) {
      return ctx.badRequest(`SessionId is required to find an order`);
    }
    // Get job by id
    const job = await retrieveJobById(jobId);

    if (!job) {
      captureSentryError(
        new Error(`Job: ${jobId} was not created for sessionId: ${sessionId}.`)
      );
      return ctx.notFound(
        `Job: ${jobId} was not created for sessionId: ${sessionId}.`
      );
    }

    const { jsonLogs } = job;

    const { results, pagination } = await strapi
      .service("api::order.order")
      .find(sanitizedQueryParams);

    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    if (!sanitizedResults || sanitizedResults.length === 0) {
      jsonLogs[
        "Failed"
      ] = `Order was not found for checkout sessionId: ${sessionId} and customer: ${email}`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.notFound(
        `Order was not found for checkout sessionId: ${sessionId} and customer: ${email}`
      );
    }

    // Get checkoutSessionId from the order
    const { checkoutSessionId, classroomOfferings, courseOfferings } =
      sanitizedResults[0];

    // Get classroom offerings and courseOfferingId ids
    const classroomOfferingIds = classroomOfferings.map(
      (classroom) => classroom.id
    );
    const courseOfferingIds = courseOfferings.map(
      (courseOfferingId) => courseOfferingId.id
    );

    let orderSession = null;
    try {
      orderSession = await retrieveStrpieCheckoutSession(checkoutSessionId);
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `There was an error retrieving a checkout session in Stripe for id: ${sessionId}. Error: ${error.message}`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.notFound(
        `There was an error retrieving a checkout session in Stripe for id: ${sessionId}. Error: ${error.message}`
      );
    }
    // store: expiration date, payment status, receipt url in our database
    const { expires_at, payment_status, payment_intent, invoice } =
      orderSession;
    if (payment_status !== "paid") {
      jsonLogs[
        "Failed"
      ] = `Payment wasn't successful in Stripe for checkout session id: ${sessionId}. Payment status: ${payment_status}.`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.send({
        payment_status,
        checkoutSessionExpiration: new Date(expires_at),
      });
    }

    jsonLogs[
      "Step 3"
    ] = `Payment for customer: ${email} completed successfully`;
    await updateJob(jobId, {
      jsonLogs,
    });

    // Retirve the invoice from Stripe
    // TODO: Create a job to run this in the background after the payment is successful
    let invoiceUrl = "";
    if (invoice) {
      const response = await retrieveInvoice(invoice);
      const { hosted_invoice_url } = response;
      invoiceUrl = hosted_invoice_url;
    }

    // Update order with the retrieved data
    const { id: orderId } = sanitizedResults[0];
    try {
      const updateResponse = await strapi.entityService.update(
        "api::order.order",
        orderId,
        {
          data: {
            paymentStatus: payment_status,
            responseMessage: orderSession,
            invoiceUrl,
            checkoutSessionExpiration: new Date(expires_at),
          },
        }
      );
      const { paymentStatus, checkoutSessionExpiration } = updateResponse;
      return ctx.send({
        paymentStatus,
        checkoutSessionExpiration,
        courseOfferingIds,
        classroomOfferingIds,
        orderId,
      });
    } catch (error) {
      jsonLogs[
        "Failed"
      ] = `There was an error updating an order in our database. Error: ${error.message}`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.badRequest(
        `There was an error updating an order in our database. Error: ${error.message}`
      );
    }
  },
}));

function getQuantityOfClassroomOffering(classroom, products) {
  // get all classroom offering ids from classroom
  const classroomOfferingIds = classroom.classroomOfferings.map(
    (classroomOffering) => classroomOffering.id
  );
  // find a product that has at least one of the classroom offering ids
  const product = products.find((product) =>
    classroomOfferingIds.includes(Number(product.classroomOfferingId))
  );
  return product?.quantity || 1;
}

function getQuantityOfCourseOffering(courseOffering, products) {
  // find a product that has at least one of the course offering ids
  const product = products.find(
    (product) => product.productId === courseOffering.stripeProductId
  );
  return product?.quantity || 1;
}
