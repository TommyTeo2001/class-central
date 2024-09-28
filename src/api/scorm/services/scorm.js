"use strict";
const {
  updateUserEnrollmentRecord,
  findEnrollmentRecordByEnrollmentId,
} = require("../utils/generalService.js");

/**
 * scorm service
 */

module.exports = () => ({
  async handleScormPostBack(...args) {
    // TODO: Update this file later, this will be used in the future to handle scorm postback
    return;
    // try {
    //   let body = args[0].request.body;
    //   if (!body) return;
    //   const { username, data, password } = body;

    //   // Validate request
    //   if (
    //     !username ||
    //     username !== process.env.SCORM_REGISTRATION_POSTBACK_USERNAME
    //   ) {
    //     return;
    //   }
    //   if (
    //     !password ||
    //     password !== process.env.SCORM_REGISTRATION_POSTBACK_PASSWORD
    //   ) {
    //     return;
    //   }
    //   if (!data) {
    //     return;
    //   }

    //   let regidArray = data.toString().match(/regid="(.*?)"/);

    //   const regisId = regidArray?.[1];

    //   setTimeout(() => {
    //     fetch(
    //       `${process.env.SCORM_REGISTRATION_URL}/registrations/${regisId}`,
    //       {
    //         method: "GET",
    //         headers: {
    //           Authorization: `Basic ${btoa(
    //             `${process.env.SCORM_APP_ID}:${process.env.SCORM_API_KEY}`
    //           )}`,
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     )
    //       .then((response) => response.json())
    //       .then((data) => {
    //         console.log("scorm registration data", data);
    //         const { firstAccessDate, completedDate } = data;
    //         findEnrollmentRecordByEnrollmentId(
    //           firstAccessDate,
    //           completedDate,
    //           regisId
    //         );
    //       })
    //       .catch((error) => console.log("scorm registration error", error));
    //   }, 5000);
    // } catch (err) {
    //   console.log("scorm service error", err);
    // }
  },
});
