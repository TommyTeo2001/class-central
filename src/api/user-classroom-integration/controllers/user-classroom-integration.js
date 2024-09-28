"use strict";
var _ = require("lodash");
const validator = require("validator");
const xss = require("xss");
const {
  createJob,
  updateJob,
  jobStatuses,
} = require("../../../utils/jobsUtil");
const {
  captureSentryErrorAndSetJobStatusToFailed,
  captureSentryError,
} = require("../../../utils/sentryUtil");
const { DynamicEmailTemplateIds } = require("../../../utils/sendgrid");

/**
 * A set of functions called "actions" for `user-classroom-integration`
 * ! This has been created mainly for the FYIU integration, we will need to make this more generic for other integrations
 */

module.exports = {
  createUserAndEnrollInClassroom: async (ctx, next) => {
    const validRequest = strapi
      .service("api::user-classroom-integration.user-classroom-integration")
      .validatRequest(ctx);

    if (!validRequest) {
      return ctx.send({
        status: 400,
        data: [],
        error: {
          message: "Invalid request",
        },
      });
    }
    const jsonLogs = {};
    // TODO: Sanitize the request body
    const { email, line_items: lineItems } = ctx.request.body;
    const lineItem = lineItems.find(
      (item) =>
        item.sku === process.env.FYI_CERTIFICATE_IN_YOUTH_DISCIPLESHIP_SKU
    );
    const certificate = lineItem?.sku || "";
    const sanitizedEmail = xss(email);
    const sanitizedCertificate = xss(certificate);
    const certificateKebabCase = _.kebabCase(sanitizedCertificate);

    const jobDescription = `Create classroom enrollment for userEmail: ${sanitizedEmail} with certificate: ${sanitizedCertificate}`;
    const { id: jobId, jobNumber } = await createJob(jobDescription, {});

    if (!jobId) {
      await captureSentryError(
        new Error(
          `There was an error creating a job for the user-classroom integration for ${sanitizedEmail}, certificate: ${sanitizedCertificate}`
        )
      );
      return ctx.notFound(
        `There was an error creating a job for the user-classroom integration for ${sanitizedEmail}, certificate: ${sanitizedCertificate}`
      );
    }

    if (
      validator.isEmpty(sanitizedEmail) ||
      !validator.isEmail(sanitizedEmail)
    ) {
      jsonLogs[
        "Failed"
      ] = `The email provided (${sanitizedEmail}) was an invalid email address or it was empty.`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await strapi
        .service("api::user-classroom-integration.user-classroom-integration")
        .getExistingUser(ctx, sanitizedEmail);

      if (!!existingUser && existingUser?.length > 0) {
        jsonLogs[
          `User`
        ] = `${sanitizedEmail} already exists in our database, therefore we are only enrolling them in the classroom/certificate: ${sanitizedCertificate}`;

        // Enroll the user in the classroom
        const { id: userId, email: userEmail } = existingUser[0];
        const redirectUrl = new URL(
          `${process.env.CLIENT_PRODUCTION_URL}/myLearning`
        );
        // const redirectUrl = new URL("http://127.0.0.1:3000/myLearning");
        await strapi
          .service("api::user-classroom-integration.user-classroom-integration")
          .enrollUserInClassrooms(
            ctx,
            certificateKebabCase,
            userId.toString(),
            userEmail.toString(),
            jobId,
            jsonLogs
          );

        // Update job and notify the existing user
        await strapi
          .service("api::user-classroom-integration.user-classroom-integration")
          .updateJobAndnotifyUser(
            ctx,
            jobId,
            sanitizedEmail,
            "",
            redirectUrl,
            sanitizedCertificate,
            jsonLogs,
            DynamicEmailTemplateIds.FYI_YOUTH_MINISTRY_CERTIFICATE_SUCCESSFUL_SETUP_OLD_USERS
          );
      } else {
        // Get custom from body of request
        const { customer } = ctx.request.body;
        const first_name = customer?.first_name || "";
        const last_name = customer?.last_name || "";

        const tempPassword = Math.random().toString(36).slice(-8);

        // Create a new user
        const newUser = await strapi
          .service("api::user-classroom-integration.user-classroom-integration")
          .createUser(ctx, sanitizedEmail, tempPassword, first_name, last_name);

        jsonLogs[
          `User`
        ] = `${sanitizedEmail} does not exist, therefore we are creating a new user and enrolling them in the classroom`;

        if (_.isEmpty(newUser)) {
          jsonLogs[
            "Failed"
          ] = `Error creating a new user for ${sanitizedEmail}, for Certificate: ${sanitizedCertificate}`;
          await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
          return;
        }

        const { id: userId, email: userEmail } = newUser;
        const redirectUrl = new URL(
          `${process.env.CLIENT_PRODUCTION_URL}/completeUserIntegration/${userId}`
        );
        // const redirectUrl = `http://127.0.0.1:3000/completeUserIntegration/${userId}`;
        await strapi
          .service("api::user-classroom-integration.user-classroom-integration")
          .enrollUserInClassrooms(
            ctx,
            certificateKebabCase,
            userId.toString(),
            userEmail.toString(),
            jobId,
            jsonLogs
          );

        // Update job and notify the new user
        await strapi
          .service("api::user-classroom-integration.user-classroom-integration")
          .updateJobAndnotifyUser(
            ctx,
            jobId,
            sanitizedEmail,
            tempPassword,
            redirectUrl,
            sanitizedCertificate,
            jsonLogs,
            DynamicEmailTemplateIds.FYI_YOUTH_MINISTRY_CERTIFICATE_ACCOUNT_SETUP_NEW_USERS
          );
      }

      // If a job Id created successfully, return a success message
      return ctx.send({
        status: 200,
        data: {
          jobId,
          jobNumber,
        },
      });
    } catch (err) {
      jsonLogs["Failed"] = err.message || "An error occurred";
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      throw new Error(err);
    }
  },
};
