const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
//javascript

const DynamicEmailTemplateIds = {
  FYI_YOUTH_MINISTRY_CERTIFICATE_ACCOUNT_SETUP_NEW_USERS:
    "d-4c8a59af311c4376aea770e0a4fc79d0",
  FYI_YOUTH_MINISTRY_CERTIFICATE_FAILED_SETUP:
    "d-19ef09fb02d5482583b18f2d8b99a748",
  FYI_YOUTH_MINISTRY_CERTIFICATE_SUCCESSFUL_SETUP_OLD_USERS:
    "d-c9988dfc44af403eb76dc0b62273585e",
  ONBOARDING_WELCOME_EMAIL: "d-2ed747fec0f6453a88e582aac21f6b74",
  ONBOARDING_REMINDER_EMAIL: "d-6f6b9d0f6ad0480582dd924332a01516",
  CLASSROOM_INVITATION_ADMIN_TO_LEANER: "d-dace9c33d69c4530aa621b5a16ba9952",
  ADMIN_GROUP_PURCHASE: "d-3af38fe7812b4e2e9c00cc8e500897b3",
};

const equipSupportEmail = "equip.support@fuller.edu";

// Function to send email using SendGrid
async function sendEmailWithTemplateId(email, templateId, dynamicData) {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email,
    from: {
      email: equipSupportEmail,
      name: "Fuller Equip",
    },
    replyTo: {
      email: equipSupportEmail,
      name: "Fuller Equip Support",
    },
    template_id: templateId,
    dynamic_template_data: dynamicData,
  };

  try {
    const emailResponse = await sgMail.send(msg);
    if (emailResponse?.[0].statusCode === 202) {
      return { status: 202, message: "Email sent" };
    }
  } catch (error) {
    const errors = error?.response?.body?.errors;

    if (errors.length === 0 || !errors) {
      return { status: 500, message: "Error sending email" };
    }
    const allErrors = errors.map((error) => error.message).join(" ");
    return { status: 500, message: allErrors };
  }
}

module.exports = {
  sendEmailWithTemplateId,
  DynamicEmailTemplateIds,
};
