// @ts-nocheck
"use strict";

const {
  sendEmailWithTemplateId,
  DynamicEmailTemplateIds,
} = require("../../../utils/sendgrid");
const jwt = require("jsonwebtoken");
const { captureSentryError } = require("../../../utils/sentryUtil");

// TODO: We need to sanitize some of these inputs/query params
module.exports = {
  async confirmRoleChange(ctx) {
    const { isReminder } = ctx.request.body;
    const { id, email } = ctx.state.user;

    const { authorization } = ctx.request.headers;

    if (!authorization) {
      captureSentryError(new Error(`Authorization header is missing.`));
      return ctx.unauthorized("Authorization header is missing");
    }
    if (!id) {
      captureSentryError(new Error(`User ID is required.`));
      return ctx.badRequest("User ID is required");
    }

    try {
      const token = jwt.sign(
        { id },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );

      const dynamicData = {
        url: `${process.env.STRAPI_PRODUCTION_URL}/api/change-role?token=${token}`,
      };
      const emailResult = await sendEmailWithTemplateId(
        email,
        isReminder
          ? DynamicEmailTemplateIds.ONBOARDING_REMINDER_EMAIL
          : DynamicEmailTemplateIds.ONBOARDING_WELCOME_EMAIL,
        dynamicData
      );

      return ctx.send({
        message: "Email Sent",
        emailStatus: emailResult.status,
      });
    } catch (error) {
      captureSentryError(
        "There was a problem with your request. Please try again later. ",
        error
      );
      return ctx.badRequest("An error occurred", error);
    }
  },

  async changeUserRole(ctx) {
    const token = ctx.query.token;

    if (!token) {
      captureSentryError(new Error(`Token is not provided in the request.`));
      return ctx.unauthorized("No token provided");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    } catch (error) {
      captureSentryError(new Error(`Invalid token. Error: ${error} `));
      return ctx.unauthorized("Invalid token");
    }

    const { id } = decoded;

    try {
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ id });

      if (!user) {
        captureSentryError(new Error(`User not found.`));
        return ctx.notFound("User not found");
      }

      const updatedUser = await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id },
          data: {
            emailConfirmation: true,
          },
        });

      if (updatedUser) {
        // ! TODO: Update this once it's ready to go live
        ctx.redirect(`${process.env.CLIENT_PRODUCTION_URL}/myLearning`);
      }
    } catch (error) {
      captureSentryError(
        new Error(
          `There was a problem with your request. Please try again later. Error: ${error}`
        )
      );
      return ctx.internalServerError("An error occurred", error);
    }
  },
};
