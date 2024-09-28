const { captureSentryError } = require("../sentryUtil");
/**
 *  Fetch classroom enrollments by email and enrollmentId
 * @param extensionService
 */
function findClassroomEnorllmentsByEmailAndEnrollmentId(extensionService) {
  extensionService.use(({ nexus }) => ({
    typeDefs: `
            type Query {
              classroomEnrollmentsByEmail(enrollId: String!, email: String!): [ClassroomEnrollmentRecords]
            }
      
            type CourseOffering {
              id: ID!
              slug: String
            }
      
            type Classroom {
              classroomTitle: String!
            }
            

      
            type ClassroomEnrollmentOffering {
              id: ID
              offeringTitle: String
              startDate: String
              endDate: String
              estimatedTime: String
              slug: String
              about: String
              learnersView: Boolean
              classroom: Classroom
              learningComponents :JSON
            }
      
            type thumbnail {
              id: ID!
              url: String
              formats: JSON
              alternativeText: String
            }

            type LinkOfferingProps {
                id: ID!
                title: String
                url: String
                description: String
            }
           
            type EnrollmentCourse {
              id: ID!
              enrollmentId: String
              courseOffering: CourseOffering
              scormRegistration: Boolean
              enrollmentLifecycle: String
              updatedAt: String
            }
          
            type ClassroomEnrollmentRecords {
              id: ID!
              enrollmentId: String
              progress: String
              classroomOffering: ClassroomEnrollmentOffering
              courseEnrollments: [EnrollmentCourse]
              userEmail: String
            }
            `,
    resolvers: {
      Query: {
        classroomEnrollmentsByEmail: {
          resolve: async (parent, args, context) => {
            const data = await strapi.services[
              "api::classroom-enrollment.classroom-enrollment"
            ].find({
              filters: {
                userEmail: { email: args.email },
                enrollmentId: args.enrollId,
              },
              populate: {
                classroomOffering: {
                  populate: {
                    classroom: true,
                    learningComponents: {
                      populate: {
                        courseOffering: {
                          populate: {
                            course: {
                              populate: {
                                instructors: true,
                                thumbnail: true,
                              },
                            },
                          },
                        },
                        link: true,
                        reflectionItems: true,
                      },
                    },
                  },
                },
                courseEnrollments: {
                  populate: {
                    courseOffering: {
                      populate: {
                        instructors: true,
                        thumbnail: true,
                      },
                    },
                  },
                },
              },
            });

            const response = data.results.map((enrollment) => {
              return {
                id: enrollment.id,
                progress: enrollment?.progress,
                enrollmentId: enrollment?.enrollmentId,
                classroomOffering: enrollment?.classroomOffering,
                courseEnrollments: enrollment?.courseEnrollments,
              };
            });
            return response;
          },
        },
      },
    },
    resolversConfig: {
      "Query.classroomEnrollmentsByEmail": {
        auth: true,
      },
    },
  }));
}

/**
 *  Create a classroom enrollment record for a user by enrolling the user in all course offerings
 *  associtated with a classroom offering
 * @param extensionService
 */
// function createUserClassroomEnrollment(extensionService) {
//   extensionService.use(({ nexus }) => ({
//     typeDefs: `
//         input MessageInput {
//           userId: String!
//           userEmail: String!
//           classroomOffering: String!
//         }

//         type Mutation {
//           createUserClassroomEnrollment(data: MessageInput): [createRecord]
//         }

//         type createRecord {
//           id: ID!
//         }
//         `,
//     resolvers: {
//       Mutation: {
//         createUserClassroomEnrollment: {
//           resolve: async (parent, args, context) => {
//             const { userId, userEmail, classroomOffering } = args?.data;
//             const data = await strapi.entityService.findOne(
//               "api::classroom-offering.classroom-offering",
//               Number(classroomOffering),
//               {
//                 fields: ["id"],
//                 populate: {
//                   learningComponents: {
//                     fields: ["id"],
//                     populate: {
//                       courseOffering: {
//                         fields: ["id"],
//                         populate: {
//                           course: {
//                             fields: ["id", "slug"],
//                           },
//                         },
//                       },
//                     },
//                   },
//                 },
//               }
//             );

//             // Get course offering and course from learning components
//             const courseOfferings = data?.learningComponents
//               .map((component) => {
//                 if (component?.courseOffering) {
//                   const courseId = component?.courseOffering?.course?.id;
//                   const courseSlug = component?.courseOffering?.course?.slug;
//                   return {
//                     courseOfferingId: component.courseOffering.id,
//                     courseId: courseId,
//                     courseSlug: courseSlug,
//                   };
//                 }
//               })
//               .filter(Boolean);

//             if (courseOfferings.length === 0) {
//               captureSentryError(
//                 new Error(
//                   `There are no courseOfferings for classroomOffering while trying to an enrollment for User: ${userId}, ${userEmail}`
//                 )
//               );
//               return null;
//             }

//             // Get a list of all course enrollments by userId
//             const userCourseEnrollments = await strapi.entityService.findMany(
//               "api::course-enrollment.course-enrollment",
//               {
//                 filters: { userId: userId },
//                 fields: ["enrollmentId"],
//               }
//             );

//             const batchSize = 15;
//             let batch = courseOfferings.splice(0, batchSize);
//             let createdCourseEnrollmentRecordIds = [];
//             while (batch.length > 0) {
//               // Filter out enrollments that already exist
//               const newEnrollmentsToBeCreated = batch.filter((element) => {
//                 const expectedEnrollmentId = `CE-${element.courseOfferingId}-${userId}`;
//                 return !userCourseEnrollments.some((enrollment) => {
//                   const result =
//                     enrollment.enrollmentId === expectedEnrollmentId;
//                   if (result) {
//                     createdCourseEnrollmentRecordIds.push(enrollment.id);
//                   }
//                   return result;
//                 });
//               });
//               // Return if no new enrollments are to be created
//               if (
//                 newEnrollmentsToBeCreated.length === 0 &&
//                 createdCourseEnrollmentRecordIds.length > 0
//               ) {
//                 try {
//                   const classroomEnrollmentResponse =
//                     await strapi.entityService.create(
//                       "api::classroom-enrollment.classroom-enrollment",
//                       {
//                         data: {
//                           classroomOffering: {
//                             connect: [
//                               {
//                                 id: classroomOffering,
//                               },
//                             ],
//                           },
//                           userId: userId,
//                           userEmail: userEmail,
//                           courseEnrollments: {
//                             connect: createdCourseEnrollmentRecordIds,
//                           },
//                         },
//                       }
//                     );
//                   return [classroomEnrollmentResponse];
//                 } catch (error) {
//                   captureSentryError(
//                     new Error(
//                       `There was an error trying to enroll User: ${userId}, ${userEmail} to classroomOffering: ${classroomOffering}. Error: ${error}`
//                     )
//                   );
//                 }
//               } else if (
//                 newEnrollmentsToBeCreated.length > 0 &&
//                 createdCourseEnrollmentRecordIds.length > 0
//               ) {
//                 try {
//                   const classroomEnrollmentResponse =
//                     await strapi.entityService.create(
//                       "api::classroom-enrollment.classroom-enrollment",
//                       {
//                         data: {
//                           classroomOffering: {
//                             connect: [
//                               {
//                                 id: classroomOffering,
//                               },
//                             ],
//                           },
//                           userId: userId,
//                           userEmail: userEmail,
//                           courseEnrollments: {
//                             connect: createdCourseEnrollmentRecordIds,
//                           },
//                         },
//                       }
//                     );
//                   captureSentryError(
//                     new Error(
//                       `classroomEnrollmentResponse after at least one enrollment already exists and others don't`
//                     )
//                   );
//                 } catch (error) {
//                   captureSentryError(
//                     new Error(
//                       `There was an error trying to enroll User: ${userId}, ${userEmail} to classroomOffering: ${classroomOffering}. Error: ${error}`
//                     )
//                   );
//                 }
//               } else if (newEnrollmentsToBeCreated.length === 0) {
//                 // Get enrollmentIds from userCourseEnrollments
//                 const userCourseEnrollmentIds = userCourseEnrollments.map(
//                   (enrollment) => {
//                     return enrollment.enrollmentId;
//                   }
//                 );
//                 captureSentryError(
//                   new Error(
//                     `There are no new enrollments to be created for User: ${userId}, ${userEmail}. Enrollments already exist for classroomOffering: ${userCourseEnrollmentIds.toString()}`
//                   )
//                 );
//                 return null;
//               }

//               try {
//                 // Create course enrollment records for each course offering without relation fields
//                 const enrollResponse = await strapi.db
//                   .query("api::course-enrollment.course-enrollment")
//                   .createMany({
//                     data: newEnrollmentsToBeCreated.map((course) => ({
//                       enrollmentId: `CE-${course.courseOfferingId}-${userId}`,
//                       userId: userId,
//                       userEmail: userEmail,
//                     })),
//                   });

//                 if (!enrollResponse || enrollResponse?.ids.length === 0)
//                   return null;

//                 // Check to see if enroll records were created
//                 const createdEnrollmentRecords = await strapi.db
//                   .query("api::course-enrollment.course-enrollment")
//                   .findMany({
//                     where: { id: { $in: enrollResponse?.ids } },
//                   });

//                 // For each createdEnrollmentRecords and courseOfferings create courseOfferings enrollment link
//                 let courseOfferingLinks = [];
//                 newEnrollmentsToBeCreated.forEach((course) => {
//                   const existingEnrollmentId = `CE-${course.courseOfferingId}-${userId}`;
//                   const associatedEnrollRecord = createdEnrollmentRecords.find(
//                     (record) => {
//                       return record.enrollmentId === existingEnrollmentId;
//                     }
//                   );
//                   if (associatedEnrollRecord) {
//                     courseOfferingLinks.push({
//                       course_enrollment_id: associatedEnrollRecord.id,
//                       course_offering_id: course.courseOfferingId,
//                     });
//                   }
//                 });

//                 if (courseOfferingLinks.length === 0) return null;

//                 const courseOfferingLinkResponse = await strapi.db.connection
//                   .insert(courseOfferingLinks)
//                   .into("course_enrollments_course_offering_links");

//                 if (!courseOfferingLinkResponse) {
//                   captureSentryError(
//                     new Error(
//                       `There was an error trying create course and course offering relationship for ${newEnrollmentsToBeCreated.toString()}, response: ${courseOfferingLinkResponse}. User: ${userId}, ${userEmail}. `
//                     )
//                   );
//                   // Delete enrollment records if course offering link creation fails
//                   await strapi.db
//                     .query("api::course-enrollment.course-enrollment")
//                     .deleteMany({
//                       where: {
//                         id: {
//                           $in: createdEnrollmentRecords.map(
//                             (record) => record.id
//                           ),
//                         },
//                       },
//                     });
//                   return null;
//                 }
//                 createdCourseEnrollmentRecordIds = createdEnrollmentRecords.map(
//                   (record) => {
//                     return { id: record.id };
//                   }
//                 );
//               } catch (error) {
//                 // Throw error message
//                 captureSentryError(
//                   new Error(
//                     `There was an error trying to enroll User: ${userId}, ${userEmail} to classroomOffering: ${classroomOffering}. Error: ${error}`
//                   )
//                 );
//               }
//               batch = courseOfferings.splice(0, batchSize);
//             }

//             // Create classroom enrollment record with all enrollmentIds
//             if (createdCourseEnrollmentRecordIds.length === 0) return null;

//             try {
//               const classroomEnrollmentResponse =
//                 await strapi.entityService.create(
//                   "api::classroom-enrollment.classroom-enrollment",
//                   {
//                     data: {
//                       classroomOffering: {
//                         connect: [
//                           {
//                             id: classroomOffering,
//                           },
//                         ],
//                       },
//                       userId: userId,
//                       userEmail: userEmail,
//                       courseEnrollments: {
//                         connect: createdCourseEnrollmentRecordIds,
//                       },
//                     },
//                   }
//                 );
//               return [classroomEnrollmentResponse];
//             } catch (error) {
//               captureSentryError(
//                 new Error(
//                   `There was an error trying to enroll User: ${userId}, ${userEmail} to classroomOffering: ${classroomOffering}. Error: ${error}`
//                 )
//               );
//             }
//           },
//         },
//       },
//     },
//     resolversConfig: {
//       "Mutation.createUserClassroomEnrollment": {
//         auth: false,
//       },
//     },
//   }));
// }

module.exports = {
  findClassroomEnorllmentsByEmailAndEnrollmentId,
};
