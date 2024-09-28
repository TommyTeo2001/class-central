const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});
const {
  captureSentryError,
  captureSentryErrorAndThrowApplicationError,
} = require("./sentryUtil");

async function createStripeProduct(data) {
  try {
    const product = await stripe.products.create(data);
    if (!product?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error creating a product ${data?.name}. Product Id was not returned.`
      );
    }
    return product;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error creating a product ${data?.name}. Error: ${error.message}.`
    );
  }
}

async function createStripePrice(data) {
  try {
    const stripePrice = await stripe.prices.create(data);
    if (!stripePrice?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error creating a price for productId ${data?.product}. Price Id was not returned.`
      );
    }
    return stripePrice;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error creating a price for productId ${data?.product}. Error: ${error.message}`
    );
  }
}

async function updateStripeProduct(productId, data) {
  try {
    const productUpdate = await stripe.products.update(productId, data);
    if (!productUpdate?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error updating a product for productId ${productId}. Product Id was not returned.`
      );
    }
    return productUpdate;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error updating a product for productId ${productId}. ${error.message}`
    );
  }
}

async function updateStripePrice(priceId, data) {
  try {
    const stripePrice = await stripe.prices.update(priceId, data);
    if (!stripePrice?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error updating the price for priceId ${priceId}. Price Id was not returned.`
      );
    }
    return stripePrice;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error updating the price for priceId ${priceId}. ${error?.message}`
    );
  }
}

async function createStripeCheckoutSession(data, lineItems) {
  try {
    const session = await stripe.checkout.sessions.create(data);
    if (!session?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error creating a session for lineItems ${JSON.stringify(
          lineItems
        )} and customer ${data?.customer}.`
      );
    }
    return session;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error creating a session, lineItems ${JSON.stringify(
        lineItems
      )} and customer ${data?.customer}. Error: ${error?.message}`
    );
  }
}

async function retrieveStrpieCheckoutSession(id) {
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    if (!session?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error retrieving a session for id ${id}.`
      );
    }
    return session;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error retrieving a session for id ${id}. ${error?.message}`
    );
  }
}

async function retrieveInvoice(id) {
  try {
    const invoice = await stripe.invoices.retrieve(id);
    if (!invoice?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error retrieving an invoice for id ${id}.`
      );
    }
    return invoice;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error retrieving an invoice for id ${id}. ${error?.message}`
    );
  }
}

async function createCustomer(data) {
  try {
    const customer = await stripe.customers.create(data);
    if (!customer?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error creating a customer for email ${data?.email}.`
      );
    }
    return customer;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error creating a customer for email ${data?.email}. ${error?.message}`
    );
  }
}

async function retrieveCustomer(id) {
  try {
    const customer = await stripe.customers.retrieve(id);
    if (!customer?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error retrieving a customer for id ${id}.`
      );
    }
    return customer;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error retrieving a customer for id ${id}. ${error?.message}`
    );
  }
}

async function updateCustomer(id, data) {
  try {
    const customer = await stripe.customers.update(id, data);
    if (!customer?.id) {
      captureSentryErrorAndThrowApplicationError(
        `Error updating a customer in Stripe for email ${data?.email}.`
      );
    }
    return customer;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error updating a customer in Stripe for email ${data?.email}. Error: ${error?.message}`
    );
  }
}

async function stripeChargeList(params) {
  try {
    const charges = await stripe.charges.list(params);
    if (!charges?.data) {
      captureSentryErrorAndThrowApplicationError(
        `Error retrieving a list of charges for params ${JSON.stringify(
          params
        )}.`
      );
    }
    return charges;
  } catch (error) {
    captureSentryErrorAndThrowApplicationError(
      `Error retrieving a list of charges for params ${JSON.stringify(
        params
      )}. ${error?.message}`
    );
  }
}

module.exports = {
  createStripeProduct,
  createStripePrice,
  updateStripeProduct,
  updateStripePrice,
  createStripeCheckoutSession,
  retrieveCustomer,
  createCustomer,
  updateCustomer,
  stripeChargeList,
  retrieveStrpieCheckoutSession,
  retrieveInvoice,
};
