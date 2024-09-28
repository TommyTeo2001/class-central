"use strict";

const { groupBy, update } = require("lodash");
const classroomOffering = require("../../classroom-offering/controllers/classroom-offering");
const courseEnrollment = require("../../course-enrollment/controllers/course-enrollment");
const { el } = require("date-fns/locale");
const {
  jobStatuses,
  updateJob,
  isJobCompleted,
} = require("../../../utils/jobsUtil");
const {
  captureSentryErrorAndSetJobStatusToFailed,
} = require("../../../utils/sentryUtil");
const { isAnyRejected } = require("../../../utils/general");
const { all } = require("lodash/fp");
const {
  sendEmailWithTemplateId,
  DynamicEmailTemplateIds,
} = require("../../../utils/sendgrid");
const {
  enrollUserInClassroom,
} = require("../../../utils/enrollments/clasroomEnrollments");

/**
 * user-classroom-integration service
 */

module.exports = () => ({
  async getExistingUser(ctx, email) {
    return await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: { email: email },
      }
    );
  },
  async createUser(ctx, email, tempPassword, first_name = "", last_name = "") {
    return await strapi.entityService.create("plugin::users-permissions.user", {
      data: {
        username: email,
        email: email,
        firstName: first_name,
        lastName: last_name,
        password: tempPassword,
        confirmed: true,
        provider: "local",
        blocked: false,
        emailConfirmation: true,
        role: {
          connect: [
            {
              id: 1,
              name: "Authenticated",
            },
          ],
        },
      },
    });
  },
  async enrollUserInClassrooms(
    ctx,
    certificateKebabCase,
    userId,
    userEmail,
    jobId,
    jsonLogs
  ) {
    const classroomOfferings = await strapi.entityService.findMany(
      "api::classroom-offering.classroom-offering",
      {
        filters: {
          classroom: {
            slug: { $eq: certificateKebabCase },
          },
        },
        populate: {
          learningComponents: {
            fields: ["id"],
            populate: {
              courseOffering: {
                fields: ["id"],
              },
            },
          },
        },
      }
    );

    if (!classroomOfferings || classroomOfferings.length === 0) {
      jsonLogs[
        "Failed"
      ] = `ClassroomOfferings for ${certificateKebabCase} does not exist`;
      await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return;
    }

    const classroomOfferingIds = classroomOfferings.map(({ id }) =>
      id.toString()
    );

    // Enroll user in classroom offerings
    await enrollUserInClassroom(
      jobId,
      jsonLogs,
      classroomOfferingIds,
      userEmail,
      userId,
      false
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));
  },
  async updateJobAndnotifyUser(
    ctx,
    jobId,
    sanitizedEmail,
    tempPassword,
    redirectUrl,
    sanitizedCertificate,
    jsonLogs,
    templateId
  ) {
    let innerCounter = 0;
    const intervalId = setInterval(async () => {
      const jobCompleted = await isJobCompleted(jobId);

      if (jobCompleted) {
        clearInterval(intervalId);
        // TODO: We have to figure out a dynamic way of getting template ID
        // Send email to the user
        const emailRepsonse = await this.sendEmail(
          sanitizedEmail,
          templateId,
          {
            password: tempPassword,
            redirectUrl: redirectUrl,
          },
          jsonLogs
        );

        if (emailRepsonse?.status === 202) {
          jsonLogs[
            `Email status:`
          ] = `Successfully sent ${sanitizedEmail} a success email.`;
          await updateJob(jobId, { status: jobStatuses.COMPLETED, jsonLogs });
        } else {
          jsonLogs[
            "Failed"
          ] = `Failed to send ${sanitizedEmail} an email. Error: ${emailRepsonse.message}`;
          await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        }
      }

      if (innerCounter >= 15 && !jobCompleted) {
        // TODO: We have to figure out a dynamic way of getting template ID
        // clear the interval if the innerCounter is greater than or equal to 15
        clearInterval(intervalId);
        const emailRepsonse = await this.sendEmail(
          sanitizedEmail,
          DynamicEmailTemplateIds.FYI_YOUTH_MINISTRY_CERTIFICATE_FAILED_SETUP,
          {
            email: sanitizedEmail,
          }
        );

        jsonLogs[
          "Failed"
        ] = `Error enrolling user in classroom for ${sanitizedEmail}, Certificate: ${sanitizedCertificate} failed`;

        if (emailRepsonse?.status === 202) {
          jsonLogs[
            `Email status:`
          ] = `Successfully sent ${sanitizedEmail} a failure email message.`;
        } else {
          jsonLogs[
            "Failed"
          ] = `Failed to send ${sanitizedEmail} an email. Error: ${emailRepsonse.message}`;
        }
        await captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      }
      innerCounter++;
    }, 5000);
  },
  async sendEmail(sanitizedEmail, templateId, dynamicData) {
    return await sendEmailWithTemplateId(
      sanitizedEmail,
      templateId,
      dynamicData
    );
  },
  validatRequest(ctx) {
    const { "x-shopify-shop-domain": xShopifyShopDomain } = ctx.headers;
    const { line_items: lineItems } = ctx.request.body;
    // Find sku in map of objects
    const hasSku = lineItems.find(
      (item) =>
        item.sku === process.env.FYI_CERTIFICATE_IN_YOUTH_DISCIPLESHIP_SKU
    );
    return (
      xShopifyShopDomain === process.env.FYI_SHOPIFY_SHOP_DOMAIN && !!hasSku
    );
  },
});
