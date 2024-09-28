var _ = require("lodash");
const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;
const { captureSentryError } = require("../../../../utils/sentryUtil");
const {
  createStripeProduct,
  createStripePrice,
  updateStripeProduct,
  updateStripePrice,
} = require("../../../../utils/stripeUtil");

async function checkClassroomPublish(id) {
  const existingClassroom = await strapi.entityService.findOne(
    "api::classroom.classroom",
    id,
    {
      populate: ["classroomOfferings"],
    }
  );
  if (existingClassroom && existingClassroom?.groupPurchase === true) {
    if (existingClassroom?.classroomOfferings.length === 0) {
      throw new ApplicationError(
        "Classroom offerings is empty and groupPurchase is turned on."
      );
    }
    const classroomOfferings = existingClassroom?.classroomOfferings;
    const groupPurchaseOfferings = classroomOfferings.filter(
      (offering) => offering.groupPurchase === true
    );
    if (groupPurchaseOfferings.length === 0) {
      throw new ApplicationError(
        "There are no classroom offerings with groupPurchase turned on."
      );
    }
    if (groupPurchaseOfferings.length > 1) {
      throw new ApplicationError(
        "There are more than one classroom offerings with groupPurchase turned on."
      );
    }
  }
}

async function checkClassroomUpdate(id, data) {
  if (
    data?.groupPurchase === true &&
    data?.classroomOfferings?.connect.length === 0
  ) {
    const existingClassroom = await strapi.entityService.findOne(
      "api::classroom.classroom",
      id,
      {
        populate: ["classroomOfferings"],
      }
    );

    if (existingClassroom?.classroomOfferings.length === 0) {
      throw new ApplicationError(
        "Classroom offerings is empty and groupPurchase is turned on."
      );
    }

    const classroomOfferings = existingClassroom?.classroomOfferings;
    const groupPurchaseOfferings = classroomOfferings.filter(
      (offering) => offering.groupPurchase === true
    );

    if (groupPurchaseOfferings.length === 0) {
      throw new ApplicationError(
        "There are no classroom offerings with groupPurchase turned on"
      );
    }

    if (groupPurchaseOfferings.length > 1) {
      throw new ApplicationError(
        "There are more than one classroom offerings with groupPurchase turned on."
      );
    }
  }

  if (
    data?.groupPurchase === true &&
    data?.classroomOfferings?.connect.length > 0
  ) {
    const classroomOfferingIds =
      data?.classroomOfferings?.connect.map((element) => element.id) || [];
    let numOfClassroomOfferingWithGroupPurchase = 0;
    const classroomOfferings = await strapi.entityService.findMany(
      "api::classroom-offering.classroom-offering",
      {
        filters: {
          id: {
            $in: classroomOfferingIds,
          },
        },
      }
    );

    classroomOfferings.forEach((element) => {
      if (element.groupPurchase === true)
        numOfClassroomOfferingWithGroupPurchase++;
    });
    if (numOfClassroomOfferingWithGroupPurchase === 0) {
      throw new ApplicationError(
        "There are no classroom offerings with groupPurchase turned on."
      );
    }
    if (numOfClassroomOfferingWithGroupPurchase > 1) {
      throw new ApplicationError(
        "There are more than one classroom offerings with groupPurchase turned on."
      );
    }
  }
}

async function groupPurchaseCheck(data, where) {
  const { id } = data;
  // When updating a groupPurchase from false to true, check to see if there's an associated classroom offering with groupPurchase checked as true
  if (id) {
    await checkClassroomUpdate(id, data);
  }
  // When publishing a classroom and groupPurchase is on, check if classroom offering with groupPurchase checked as true
  if (!!data?.publishedAt && !!where?.id) {
    await checkClassroomPublish(where.id);
  }
}

module.exports = {
  async beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    // Set slug for classroom title.
    // if (data.classroomTitle) {
    //   event.params.data.slug = _.kebabCase(data.classroomTitle);
    // }

    const { locale } = data;

    if (event.params.data.slug) {
      const duplicateSlug = await strapi.entityService.findMany(
        "api::classroom.classroom",
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

    // Set discount percentage price to 0 if it is not set.
    if (!data.discountPercentagePrice) {
      event.params.data.discountPercentagePrice = 0;
    }
  },
  async beforeUpdate(event) {
    const { data, where, select, populate } = event.params;
    // Set slug for classroom title.
    // if (data.classroomTitle) {
    //   event.params.data.slug = _.kebabCase(data.classroomTitle);
    // }

    const existingClassroom = await strapi.entityService.findOne(
      "api::classroom.classroom",
      where.id,
      {
        fields: ["slug", "locale"],
      }
    );

    const { locale } = existingClassroom;
    const { slug } = data;

    if (!!slug && slug !== existingClassroom.slug) {
      const duplicateSlug = await strapi.entityService.findMany(
        "api::classroom.classroom",
        {
          filters: {
            $or: [{ slug: slug }],
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

    // Set discount percentage price to 0 if it is not set.
    if (!data.discountPercentagePrice) {
      event.params.data.discountPercentagePrice = 0;
    }

    // Handle group purchase
    await groupPurchaseCheck(data, where);

    // TODO: Move this into a function
    // Create a new product the first time a classroom is published
    if (!!data?.publishedAt && !data?.stripeProductId) {
      const classroom = await strapi.entityService.findOne(
        "api::classroom.classroom",
        where?.id,
        {
          populate: { thumbnail: true },
        }
      );
      if (!classroom?.stripeProductId) {
        const {
          classroomTitle,
          shortDescription,
          classRoomPrice,
          thumbnail,
          slug,
        } = classroom;
        const imageUrls = !!thumbnail ? [thumbnail?.url] : [];
        const productUrl = `${process.env.CLIENT_PRODUCTION_URL}/classroom/${slug}`;

        // Create a product
        const productData = {
          name: classroomTitle,
          description: shortDescription,
          images: imageUrls,
          url: productUrl,
        };

        const stripeProduct = await createStripeProduct(productData);
        // Create a price
        const priceData = {
          unit_amount: Math.round(classRoomPrice * 100),
          currency: "usd",
          product: stripeProduct.id,
        };
        const stripePrice = await createStripePrice(priceData);
        // Update stripeProductId and stripePriceId in the classroom
        event.params.data.stripeProductId = stripeProduct.id;
        event.params.data.stripePriceId = stripePrice.id;
      }
      return;
    }

    // TODO: Move this into a function
    // Update product and prices when classroom is updated and published
    if (data?.id && data?.stripeProductId) {
      const classroom = await strapi.entityService.findOne(
        "api::classroom.classroom",
        where?.id,
        {
          populate: { thumbnail: true },
        }
      );
      if (classroom?.publishedAt) {
        const {
          classroomTitle,
          shortDescription,
          classRoomPrice,
          stripeProductId,
          stripePriceId,
          slug,
        } = data;

        const { classRoomPrice: initialClassRoomPrice } = classroom;
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
        // Create a new product when classroom price is updated and published
        // Inactivate the old price
        await updateStripeProduct(stripeProductId, {
          name: classroomTitle,
          description: shortDescription,
          url: `${process.env.CLIENT_PRODUCTION_URL}/classroom/${slug}`,
          images: imageUrls,
        });
        // Update price when classroom price is updated and published
        if (classRoomPrice !== initialClassRoomPrice) {
          const priceData = {
            product: stripeProductId,
            unit_amount: Math.round(classRoomPrice * 100),
            currency: "usd",
          };
          const stripePrice = await createStripePrice(priceData);
          // Set new price id
          event.params.data.stripePriceId = stripePrice.id;
          // Inactivate old price
          await updateStripePrice(stripePriceId, { active: false });
        }
      }
    }
  },
  async beforeDelete(event) {
    const { data, where, select, populate } = event.params;
    // Find classroom by Id
    const classroom = await strapi.entityService.findOne(
      "api::classroom.classroom",
      where?.id
    );
    const { stripeProductId, stripePriceId } = classroom;

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
