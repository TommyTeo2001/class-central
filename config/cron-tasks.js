const {
  updateEnrollments,
  updateClassroomEnrollments,
  copyCourseEnrollToTempField,
  copyCourseEnrollFromTempFieldBackToOrginal,
} = require("../src/utils/cronJobs/enrollments");

module.exports = {
  migrateEnrollmentRecords: {
    task: async ({ strapi }) => {
      console.log(
        "Start running update classroom enrollments to copy courseEnrollments to courseEnrollmentsTemp field",
        new Date()
      );
      // await copyCourseEnrollToTempField();
      await copyCourseEnrollFromTempFieldBackToOrginal();
      console.log(
        "Finished running cron job to update classroom enrollments",
        new Date()
      );

      // Completed jobs as 2024-05-21:
      // updateEnrollments();
    },
    // only run every 1 minute
    options: {
      rule: "*/2 * * * *",
      // start 10 seconds from now
      // start: new Date(Date.now() + 100000),
      // start 10 minutes from now
      // start: new Date(Date.now() + 600000),
    },
  },
};
