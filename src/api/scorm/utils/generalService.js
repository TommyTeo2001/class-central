//TODO: Remove this file
// async function findEnrollmentRecordByEnrollmentId(
//   firstAccessDate = "",
//   completedDate = "",
//   enrollmentId
// ) {
//   if (!enrollmentId) return;
//   strapi.db
//     .query("api::course-enrollment.course-enrollment")
//     .findOne({
//       select: ["id"],
//       where: { enrollmentId: enrollmentId },
//     })
//     .then((response) => {
//       const { id } = response;
//       // console.log("response from finding:::", response);
//       updateUserEnrollmentRecord(firstAccessDate, completedDate, id);
//     })
//     .catch((error) => {
//       console.log(
//         `Failed to find user with registration Id ${enrollmentId}. Error:::: ${error}`
//       );
//     });
// }
// async function updateUserEnrollmentRecord(
//   firstAccessDate = "",
//   completedDate = "",
//   enrollmentRecordId
// ) {
//   // console.log("calling update:::");
//   if (!enrollmentRecordId) return;
//   // Build data and add only records that exist to it
//   const newData = {};
//   if (firstAccessDate) {
//     newData.dateStarted = new Date(firstAccessDate).toISOString();
//   }
//   if (completedDate) {
//     newData.dateCompleted = new Date(completedDate).toISOString();
//   }
//   newData.scormRegistration = true;
//   strapi.entityService
//     .update("api::course-enrollment.course-enrollment", enrollmentRecordId, {
//       data: newData,
//     })
//     .then((response) => {
//       console.log("response from updating:::", response);
//     })
//     .catch((error) => {
//       console.log(
//         `Failed to update user with user with registration Id ${enrollmentRecordId}. Error:::: ${error}`
//       );
//     });
// }
