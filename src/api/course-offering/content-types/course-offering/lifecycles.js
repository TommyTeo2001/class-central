const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;
var _ = require("lodash");
const { checkContentData } = require("../../../../utils/collectionTypes");
const {
  createStripeProduct,
  createStripePrice,
  updateStripeProduct,
  updateStripePrice,
} = require("../../../../utils/stripeUtil");

module.exports = {
  async beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    // Set slug for classroom title.
    // if (data?.offeringTitle) {
    //   event.params.data.slug = _.kebabCase(data.offeringTitle);
    // }
    const { locale } = data;

    // Check is slug exists for the provided locale
    if (event.params.data.slug) {
      const duplicateSlug = await strapi.entityService.findMany(
        "api::course-offering.course-offering",
        {
          filters: {
            $or: [{ slug: event.params.data.slug }],
          },
          locale,
        }
      );

      if (duplicateSlug.length > 0) {
        throw new ApplicationError(
          `This slug already exists for the '${locale}' locale`
        );
      }
    }
  },
  async beforeUpdate(event) {
    const { data, where, select, populate } = event.params;

    const existingCourseOffering = await strapi.entityService.findOne(
      "api::course-offering.course-offering",
      where.id,
      {
        fields: ["slug", "locale"],
      }
    );

    const { locale } = existingCourseOffering;
    const { slug } = data;

    // Check if slug is updated and if it exists for the provided locale
    if (!!slug && slug !== existingCourseOffering.slug) {
      const duplicateSlug = await strapi.entityService.findMany(
        "api::course-offering.course-offering",
        {
          filters: {
            $or: [{ slug }],
          },
          locale,
        }
      );

      if (duplicateSlug.length > 0) {
        throw new ApplicationError(
          `This slug already exists for the '${locale}' locale`
        );
      }
    }

    if (data?.id) {
      // If end date is set, start date must be set
      if (data?.endDate && !data?.startDate) {
        throw new ApplicationError(
          "A Course Offering cannot have an end date without a start date.",
          400
        );
      }

      // Check if start date is before end date
      if (data?.endDate && data?.startDate) {
        const startDate = new Date(data?.startDate);
        const endDate = new Date(data?.endDate);
        if (startDate > endDate) {
          throw new ApplicationError(
            "A Course Offering cannot have an end date before the start date.",
            400
          );
        }
      }
    }
    // If offeringTitle is set, set slug
    // if (data?.offeringTitle) {
    //   event.params.data.slug = _.kebabCase(data.offeringTitle);
    // }

    // Create a new product the first time a course offering is published
    if (!!data?.publishedAt && !data?.stripeProductId) {
      const courseOffering = await strapi.entityService.findOne(
        "api::course-offering.course-offering",
        where?.id,
        {
          populate: { thumbnail: true },
        }
      );
      if (!courseOffering?.stripeProductId) {
        const {
          offeringTitle,
          shortDescription,
          coursePrice,
          thumbnail,
          slug,
        } = courseOffering;
        const imageUrls = !!thumbnail ? [thumbnail?.url] : [];
        const productUrl = `${process.env.CLIENT_PRODUCTION_URL}/course/${slug}`;

        // Create a product
        const productData = {
          name: offeringTitle,
          description: shortDescription,
          images: imageUrls,
          url: productUrl,
        };
        const stripeProduct = await createStripeProduct(productData);

        // Create a price
        const priceData = {
          unit_amount: Math.round(coursePrice * 100),
          currency: "usd",
          product: stripeProduct.id,
        };
        const stripePrice = await createStripePrice(priceData);

        // Update stripeProductId and stripePriceId in the course
        event.params.data.stripeProductId = stripeProduct.id;
        event.params.data.stripePriceId = stripePrice.id;
      }
      return;
    }

    // Update product and prices when course offering is updated and published
    if (data?.id && data?.stripeProductId) {
      const courseOffering = await strapi.entityService.findOne(
        "api::course-offering.course-offering",
        where?.id
      );
      if (courseOffering?.publishedAt) {
        const {
          offeringTitle,
          shortDescription,
          slug,
          coursePrice,
          stripeProductId,
          stripePriceId,
        } = data;
        const { coursePrice: initialPrice } = courseOffering;
        // Since data doesn't have the thumbnail object, we need to fetch it
        const { thumbnail } = data;
        const imageUrls = [];
        if (!!thumbnail) {
          const upload = await strapi.entityService.findOne(
            "plugin::upload.file",
            thumbnail
          );
          imageUrls.push(upload.url);
        }
        // Update the product when the course is updated and published
        await updateStripeProduct(stripeProductId, {
          name: offeringTitle,
          description: shortDescription,
          url: `${process.env.CLIENT_PRODUCTION_URL}/course/${slug}`,
          images: imageUrls,
        });
        // Create a new product price when course prices are updated and it's published
        // Inactive old price
        if (coursePrice !== initialPrice) {
          const priceData = {
            product: stripeProductId,
            unit_amount: Math.round(coursePrice * 100),
            currency: "usd",
          };
          const stripePrice = await createStripePrice(priceData);
          // Set new price id
          event.params.data.stripePriceId = stripePrice.id;
          // Inactive old price
          await updateStripePrice(stripePriceId, { active: false });
        }
      }
    }
  },
  async beforeDelete(event) {
    const { data, where, select, populate } = event.params;
    // Find course offering by Id
    const courseOffering = await strapi.entityService.findOne(
      "api::course-offering.course-offering",
      where.id
    );
    const { stripeProductId, stripePriceId } = courseOffering;

    if (!stripeProductId && !stripePriceId) {
      return;
    }
    // Update product price if it exists to inactive
    if (stripePriceId)
      await updateStripePrice(stripePriceId, { active: false });
    // Update product if it exists to inactive
    if (stripeProductId)
      await updateStripeProduct(stripeProductId, { active: false });
  },
};
