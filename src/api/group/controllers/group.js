"use strict";
const {
  captureSentryError,
  captureSentryErrorAndReturnBadRequest,
  captureSentryErrorAndSetJobStatusToFailed,
} = require("../../../utils/sentryUtil");
const {
  sendEmailWithTemplateId,
  CLASSROOM_INVITATION_ADMIN_TO_LEANER,
  DynamicEmailTemplateIds,
} = require("../../../utils/sendgrid");
const {
  updateJob,
  createJob,
  jobStatuses,
} = require("../../../utils/jobsUtil");
const {
  enrollUserInClassroom,
  enrollLearnerIntoClassroomExistingGroup,
} = require("../../../utils/enrollments/clasroomEnrollments");
const { createUser } = require("../../../utils/users/userCollection");

/**
 * group controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

// const redirectUrlFrontEnd = `${process.env.CLIENT_LOCAL_URL}`;
// const redirectUrlBackEnd = `${process.env.STRAPI_LOCAL_URL}`;
const redirectUrlFrontEnd = `${process.env.CLIENT_PRODUCTION_URL}`;
const redirectUrlBackEnd = `${process.env.STRAPI_PRODUCTION_URL}`;

module.exports = createCoreController("api::group.group", ({ strapi }) => ({
  /**
   * Invite learners to a groups
   * @return {object}
   */
  async inviteLearners(ctx) {
    await this.validateQuery(ctx);
    const sanitizedBody = await this.sanitizeInput(ctx.request.body);
    const { groupId, inviteEmails, resendInvite } = sanitizedBody;
    const { id: userId, email, firstName, lastName } = ctx.state.user;

    // Validate inviteEmails to check if it is an array
    if (!Array.isArray(inviteEmails) || inviteEmails.length === 0) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group invite Error: The invite emails provided should be an array or should not be empty for Admin user: [${userId}] for Group: [${groupId}]`,
        ctx
      );
    }

    // validate resendInvite if it's a boolean
    if (typeof resendInvite !== "boolean") {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group invite Error: Resend invite should be a boolean for Admin user: [${userId}] for Group: [${groupId}]`
      );
    }

    // Fetch the group and check if the user is an admin
    let group;
    try {
      group = await strapi.service("api::group.group").findGroupById(groupId);

      if (!group) {
        return captureSentryErrorAndReturnBadRequest(
          `Admin group invite Error: Group with id: [${groupId}] does not exist for Admin user: [${userId}]`,
          ctx
        );
      }

      // If group.pendingLearners is empty, set it to an empty array
      if (!group.pendingLearners) {
        group.pendingLearners = [];
      }

      // Check if the user is an admin
      const isAdmin = group?.admins.some((admin) => admin?.id === userId);

      if (!isAdmin) {
        return ctx.badRequest(`User ${userId} is not an admin of this group`);
      }
    } catch (error) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group invite Error: [${error?.message}] for Admin user: ${userId} for Group: [${groupId}]`,
        ctx
      );
    }

    // Check if inviteEmails contains email
    if (inviteEmails.includes(email)) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group invite Error: You cannot invite yourself to Group: [${groupId}] as a learner. Admin user: [${userId}] `,
        ctx
      );
    }

    // Check if the number of invites/emails is less than or equal to the number of seats left
    if (inviteEmails.length > group?.numberOfSeats && !resendInvite) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group invite Error: The number of invites: [${inviteEmails.length}] for Admin User: [${userId}] is greater than the number of seats left: [${group?.numberOfSeats}] for group: ${groupId}`,
        ctx
      );
    }

    // Check if the emails provided exist in the pendingLearners array
    const emailsNotInPendingLearners = inviteEmails.filter(
      (email) => !group?.pendingLearners.includes(email)
    );

    // Get offerTtitle from group
    const classroomTitle =
      group?.classroomOfferings[0]?.classroom?.classroomTitle || "a Classroom";

    // Get Admin's name
    const adminName =
      firstName && lastName ? `${firstName} ${lastName}` : email;

    if (resendInvite) {
      if (emailsNotInPendingLearners.length > 0) {
        return captureSentryErrorAndReturnBadRequest(
          `Admin group invite Error: The following emails: [${emailsNotInPendingLearners.join(
            ", "
          )}] do not exist in this User Admin's: [${userId}] pending Learner invites for Group: ${groupId}`,
          ctx
        );
      }
    }

    const sendEmailPromises = inviteEmails.map((email) => {
      const endcodedEmail = encodeURIComponent(email);
      const completeUserCreationPage = `${redirectUrlBackEnd}/api/group/convertPendingLearners?groupId=${groupId}&convertPendingEmail=${endcodedEmail}`;
      return sendEmailWithTemplateId(
        email,
        DynamicEmailTemplateIds.CLASSROOM_INVITATION_ADMIN_TO_LEANER,
        {
          acceptInviteUrl: completeUserCreationPage,
          classroomTitle: classroomTitle,
          adminName,
        }
      );
    });

    let emailResponse = null;
    try {
      emailResponse = await Promise.all(sendEmailPromises);

      if (!emailResponse.map((res) => res.status).includes(202)) {
        return captureSentryErrorAndReturnBadRequest(
          `Admin group invite Error: There was an error sending the invite email for Admin user: ${userId} for Group: ${groupId} to the following emails: [${inviteEmails.join(
            ", "
          )}]. Error: ${emailResponse.map((res) => res.message).join(", ")}`,
          ctx
        );
      }
    } catch (error) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group invite Error: There was an error sending the invite email for Admin user: ${userId} for Group: ${groupId} to the following emails: [${inviteEmails.join(
          ", "
        )}]`,
        ctx
      );
    }

    if (resendInvite) {
      return ctx.send({
        message: `Admin group invite: The invite email has been resent to the following emails: [${inviteEmails.join(
          ", "
        )}]`,
        status: 200,
      });
    }

    // Update the group with the new pendingLearners and remove duplicates
    const newPendingLearners = Array.from(
      new Set([...group.pendingLearners, ...inviteEmails].filter(Boolean))
    );

    // Decrease the number of seats left only if an email in inviteEmails is not in the pendingLearners array of the group
    let numberOfSeats = group.numberOfSeats - emailsNotInPendingLearners.length;

    let updateGroupResponse = null;
    try {
      updateGroupResponse = await strapi
        .service("api::group.group")
        .updateGroup(group.id, {
          pendingLearners: newPendingLearners,
          numberOfSeats,
        });
    } catch (error) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group invite Error: There was an error updating the group with the new pendingLearners for Admin user: ${userId} for Group: ${groupId}`,
        ctx
      );
    }

    if (updateGroupResponse) {
      return ctx.send({
        message: `Admin group invite: The invite email has been sent to the following emails: [${inviteEmails.join(
          ", "
        )}]`,
        status: 200,
        invitedEmails: inviteEmails,
      });
    }
  },
  /**
   * Remove pending learners from a groups
   * @return {object}
   */
  async removePendingLearners(ctx) {
    await this.validateQuery(ctx);
    const sanitizedBody = await this.sanitizeInput(ctx.request.body);
    const { groupId, removePendingEmail } = sanitizedBody;
    const { id: userId, email } = ctx.state.user;

    // Validate removePendingEmail to check if it is an array
    if (!removePendingEmail) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group remove Error: The removePendingEmail provided should be an array or should not be empty for Admin user: [${userId}] for Group: [${groupId}]`,
        ctx
      );
    }

    // Fetch the group and check if the user is an admin
    let group;
    try {
      group = await strapi.service("api::group.group").findGroupById(groupId);

      if (!group) {
        return captureSentryErrorAndReturnBadRequest(
          `Admin group remove Error: Group with id: [${groupId}] does not exist for Admin user: [${userId}]`,
          ctx
        );
      }

      // Check if the user is an admin
      const isAdmin = group?.admins.some((admin) => admin?.id === userId);

      if (!isAdmin) {
        return ctx.badRequest(
          `User: [${userId}] is not an admin of this group`
        );
      }
    } catch (error) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group remove Error: [${error?.message}] for Admin user: [${userId}] for Group: [${groupId}]`,
        ctx
      );
    }

    // Check if the emails provided exist in the pendingLearners array
    const isEmailInPending =
      group?.pendingLearners.includes(removePendingEmail);

    if (!isEmailInPending) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group remove Error: This email: [${removePendingEmail}] does not exist in this User Admin's: [${userId}] pending Learner invites for Group: ${groupId}`,
        ctx
      );
    }

    // Remove the pending learners and increase the number of seats left
    const newPendingLearners = group.pendingLearners.filter(
      (email) => email !== removePendingEmail
    );

    let updateGroupResponse = null;
    try {
      updateGroupResponse = await strapi
        .service("api::group.group")
        .updateGroup(group.id, {
          pendingLearners: newPendingLearners,
          numberOfSeats: group.numberOfSeats + 1,
        });
    } catch (error) {
      return captureSentryErrorAndReturnBadRequest(
        `Admin group remove Error: There was an error updating the group with the new pendingLearners for Admin user: ${userId} for Group: ${groupId}`,
        ctx
      );
    }
    if (updateGroupResponse) {
      return ctx.send({
        message: "Remove Learner Successfully",
        status: 200,
      });
    }
  },
  /** TODO: Find a way to consolidate both convertPendingLearners
   * Convert pending learners to learners
   * @return {object}
   */
  async convertPendingLearners(ctx) {
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    const { convertPendingEmail, groupId } = sanitizedQueryParams;

    if (!convertPendingEmail || !groupId) {
      captureSentryError(
        `Convert Pending learner Error: convertPendingLearners api was called without a convertPendingEmail or groupId provided`
      );
      return ctx.redirect(`${redirectUrlFrontEnd}/error/2`);
    }

    // Check if email exist in our system
    const user = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        fields: ["id", "email"],
        filters: {
          email: {
            $eq: convertPendingEmail,
          },
        },
      }
    );

    if (!user || user.length === 0) {
      // redirect to the complete user creation page
      const endcodedEmail = encodeURIComponent(convertPendingEmail);
      return ctx.redirect(
        `${redirectUrlFrontEnd}/groupUserCreationPage?email=${endcodedEmail}&groupId=${groupId}`
      );
    }
    const { id: userId } = user[0];

    const jsonLogs = {};
    const jobDescription = `Add learner: ${convertPendingEmail} to group: [${groupId}]`;
    const { id: jobId, jobNumber } = await createJob(jobDescription, {});

    if (!jobId) {
      captureSentryError(
        `Convert Pending learner Error: There was an error creating a job for learner: ${convertPendingEmail} into Group with: [${groupId}]`
      );
      return ctx.redirect(`${redirectUrlFrontEnd}/error/2`);
    }

    try {
      // Fetch the group and check if the user is an admin
      const group = await strapi
        .service("api::group.group")
        .findGroupById(groupId);

      if (!group) {
        jsonLogs[
          `Failed`
        ] = `Convert Pending learner Error: Group with id: [${groupId}] does not exist`;
        captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        return ctx.redirect(`${redirectUrlFrontEnd}/error/2`);
      }

      // Check if the email provided exist in the Learners array
      const isEmailInLearners = group?.learners
        .map((learner) => learner.id)
        .includes(userId);
      if (isEmailInLearners) {
        jsonLogs[
          `Success`
        ] = `Convert Pending learner: This email provided: [${convertPendingEmail}] is already a learner in this group: [${group.groupName}, ${groupId}]`;

        updateJob(jobId, {
          jsonLogs,
          status: jobStatuses.COMPLETED,
        });
        return ctx.redirect(`${redirectUrlFrontEnd}/myLearning`);
      }

      // Check if the emails provided exist in the pendingLearners array
      const isEmailInPending =
        group?.pendingLearners.includes(convertPendingEmail);
      if (!isEmailInPending) {
        jsonLogs[
          `Failed`
        ] = `Convert Pending learner Error: This email provided: [${convertPendingEmail}] does not exist in this group's: [${group.groupName}, ${groupId}] pending Learners`;
        captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        return ctx.redirect(`${redirectUrlFrontEnd}/error/7`);
      }

      // Enroll user in classroom offering
      const classroomOfferingIds = group.classroomOfferings.map((co) =>
        co.id.toString()
      );

      const classroomEnrollmentResponse =
        await enrollLearnerIntoClassroomExistingGroup(
          jobId,
          jsonLogs,
          classroomOfferingIds,
          convertPendingEmail,
          userId,
          false,
          [groupId]
        );

      // Update group (remove from pendinglearners and add to learners)
      const newPendingLearners = group.pendingLearners.filter(
        (email) => email !== convertPendingEmail
      );

      const updateGroupResponse = await strapi
        .service("api::group.group")
        .updateGroup(group.id, {
          pendingLearners: newPendingLearners,
        });

      if (!updateGroupResponse) {
        jsonLogs[
          `Failed`
        ] = `Convert Pending learner Error: There was an error updating the group with the new pendingLearners for Admin user: ${userId} and Group: [${group.groupName}, ${groupId}]`;
        captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        return ctx.redirect(`${redirectUrlFrontEnd}/error/2`);
      }

      jsonLogs[
        `Group updated`
      ] = `Successfully updated group: [${group.groupName}, ${groupId}] with a new learner: [${convertPendingEmail}]`;

      const classroomEnrollmentId =
        classroomEnrollmentResponse[0]?.enrollmentId;

      updateJob(jobId, {
        jsonLogs,
        status: jobStatuses.COMPLETED,
      });

      return !!classroomEnrollmentId
        ? ctx.redirect(
            `${redirectUrlFrontEnd}/myLearning/classroom/${classroomEnrollmentId}`
          )
        : ctx.redirect(`${redirectUrlFrontEnd}/myLearning`);
    } catch (error) {
      jsonLogs[
        `Failed`
      ] = `Convert Pending learner Error: There was an error with your group invitation for: [${groupId}]. ${error?.message}`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.redirect(`${redirectUrlFrontEnd}/error/2`);
    }
  },
  /**
   * Convert pending learners to learners but only for new users
   * @return {object}
   */
  async convertPendingLearnersNewUsers(ctx) {
    const sanitizedBody = await this.sanitizeInput(ctx.request.body);
    const { convertPendingEmail, groupId } = sanitizedBody;

    if (!convertPendingEmail || !groupId) {
      captureSentryError(
        `Convert Pending learner Error: convertPendingLearners api was called without a convertPendingEmail or groupId provided`
      );
      return ctx.send({
        error: "Email and groupId are required",
        status: 400,
      });
    }

    // Check if email exist in our system
    const user = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        fields: ["id", "email"],
        filters: {
          email: {
            $eq: convertPendingEmail,
          },
        },
      }
    );

    if (!user || user.length === 0) {
      return ctx.send({
        error: "User does not exist in our system",
        status: 400,
      });
    }
    const { id: userId } = user[0];

    const jsonLogs = {};
    const jobDescription = `Add learner: ${convertPendingEmail} to group: [${groupId}]`;
    const { id: jobId, jobNumber } = await createJob(jobDescription, {});

    if (!jobId) {
      captureSentryError(
        `Convert Pending learner Error: There was an error creating a job for learner: ${convertPendingEmail} into Group with: [${groupId}]`
      );
      return ctx.send({
        error:
          "There was an error adding you to the group. Please contact support",
        status: 400,
      });
    }

    try {
      // Fetch the group and check if the user is an admin
      const group = await strapi
        .service("api::group.group")
        .findGroupById(groupId);

      if (!group) {
        jsonLogs[
          `Failed`
        ] = `Convert Pending learner Error: Group with id: [${groupId}] does not exist`;
        captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        return ctx.send({
          error:
            "There was an error adding you to the group. Please contact support",
          status: 400,
        });
      }

      // If group.pendingLearners is empty, set it to an empty array
      if (!group.pendingLearners) {
        group.pendingLearners = [];
      }

      // Check if the email provided exist in the Learners array
      const isEmailInLearners = group?.learners
        .map((learner) => learner.id)
        .includes(userId);
      if (isEmailInLearners) {
        jsonLogs[
          `Success`
        ] = `Convert Pending learner: This email provided: [${convertPendingEmail}] is already a learner in this group: [${group.groupName}, ${groupId}]`;

        updateJob(jobId, {
          jsonLogs,
          status: jobStatuses.COMPLETED,
        });
        return ctx.send({
          message:
            "Are already a learner in the group. You will be redirected shortly.",
          status: 200,
          redirectUrl: `${redirectUrlFrontEnd}/myLearning`,
        });
      }

      // Check if the emails provided exist in the pendingLearners array
      const isEmailInPending =
        group?.pendingLearners.includes(convertPendingEmail);
      if (!isEmailInPending) {
        jsonLogs[
          `Failed`
        ] = `Convert Pending learner Error: This email provided: [${convertPendingEmail}] does not exist in this group's: [${group.groupName}, ${groupId}] pending Learners`;
        captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        return ctx.send({
          error:
            "The email provided does not exist in the group's pending learners. Please contact support",
          status: 400,
        });
      }

      const isAdmin = group?.admins.some(
        (admin) => admin?.email === convertPendingEmail
      );

      if (isAdmin) {
        jsonLogs[
          `Failed`
        ] = `Convert Pending learner Error: This email provided: [${convertPendingEmail}] is already an admin in this group's: [${group.groupName}, ${groupId}]`;
        captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        return ctx.send({
          error:
            "The email provided is already an admin in the group. Please contact support",
          status: 400,
        });
      }

      // Update group (remove from pendinglearners and add to learners)
      const newPendingLearners = group.pendingLearners.filter(
        (email) => email !== convertPendingEmail
      );

      const updateGroupResponse = await strapi
        .service("api::group.group")
        .updateGroup(group.id, {
          pendingLearners: newPendingLearners,
        });

      if (!updateGroupResponse) {
        jsonLogs[
          `Failed`
        ] = `Convert Pending learner Error: There was an error updating the group with the new pendingLearners for Admin user: ${userId} and Group: [${group.groupName}, ${groupId}]`;
        captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
        return ctx.send({
          error:
            "There was an error adding you to the group. Please contact support",
          status: 400,
        });
      }

      jsonLogs[
        `Group updated`
      ] = `Successfully updated group: [${group.groupName}, ${groupId}] by removing : [${convertPendingEmail}] from pending learners`;

      // Enroll user in classroom offering
      const classroomOfferingIds = group.classroomOfferings.map((co) =>
        co.id.toString()
      );

      const classroomEnrollmentResponse =
        await enrollLearnerIntoClassroomExistingGroup(
          jobId,
          jsonLogs,
          classroomOfferingIds,
          convertPendingEmail,
          userId,
          false,
          [groupId]
        );

      // get classroom offering id
      const classroomEnrollmentId =
        classroomEnrollmentResponse[0]?.enrollmentId;

      updateJob(jobId, {
        jsonLogs,
        status: jobStatuses.COMPLETED,
      });

      // Redirect to the classroom is it's an existing user
      return ctx.send({
        message:
          "Successfully added you to the group. You will be redirected shortly.",
        status: 200,
        redirectUrl: !!classroomEnrollmentId
          ? `${redirectUrlFrontEnd}/myLearning/classroom/${classroomEnrollmentId}`
          : `${redirectUrlFrontEnd}/myLearning`,
      });
    } catch (error) {
      jsonLogs[
        `Failed`
      ] = `Convert Pending learner Error: There was an error with your group invitation for: [${groupId}]. ${error?.message}`;
      captureSentryErrorAndSetJobStatusToFailed(jobId, jsonLogs);
      return ctx.send({
        error:
          "There was an error adding you to the classroom. Please contact support",
        status: 400,
      });
    }
  },
}));
