// /**
//  *  Find a course by its slug.
//  * @param extensionService
//  */
// function findCourseBySlug(extensionService) {
//   extensionService.use(({ nexus }) => ({
//     typeDefs: `
//         type Query {
//           courseSlug(slug: String!): [CourseCourseOffering]
//         }

//         type courseOffering {
//           id: ID!
//           offeringTitle: String!
//           startDate: String
//           endDate: String
//           status: String
//           estimatedTime: String
//         }

//         type Lesson {
//           id: ID!
//           lessonName: String
//           lessonDescription: String
//         }

//         type CourseOverview {
//           id: ID!
//           sectionTitle: String
//           lessons: [Lesson]
//         }

//         type thumbnail {
//           id: ID!
//           url: String
//           formats: JSON
//           alternativeText: String
//         }

//         type Categories {
//           id: ID!
//           name: String!
//         }

//         type instructor {
//           id: ID!
//           name: String!
//           credentials: String
//           image: thumbnail
//           about: String
//         }

//         type Seo {
//           id: ID!
//           metaTitle: String!
//           metaDescription: String!
//           keywords: String
//           metaRobots: String
//           structuredData: JSON
//           metaViewport: String
//           canonicalURL: String
//         }

//         type CourseCourseOffering {
//           id: ID!
//           courseTitle: String!
//           slug: String!
//           instructors: [instructor]
//           estimatedTime: String
//           shortDescription: String
//           longDescription: String
//           coursePrice: Float
//           discountPercentagePrice: Float
//           stripeProductId: String
//           stripePriceId: String
//           createdAt: String!
//           status: String
//           visibility: String
//           courseOfferings: [courseOffering]
//           courseOverview: [CourseOverview]
//           thumbnail: thumbnail
//           categories: [Categories]
//           seo: Seo
//         }
//         `,
//     resolvers: {
//       Query: {
//         courseSlug: {
//           resolve: async (parent, args, context) => {
//             const data = await strapi.services["api::course.course"].find({
//               filters: { slug: args.slug },
//               populate: {
//                 courseOverview: {
//                   populate: {
//                     lessons: true,
//                   },
//                 },
//                 thumbnail: true,
//                 categories: true,
//                 seo: true,
//               },
//             });

//             const response = data.results.map((course) => {
//               return {
//                 id: course.id,
//                 courseTitle: course.courseTitle,
//                 slug: course.slug,
//                 coursePrice: course.coursePrice,
//                 discountPercentagePrice: course.discountPercentagePrice,
//                 stripeProductId: course.stripeProductId,
//                 stripePriceId: course.stripePriceId,
//                 instructors: course.instructors,
//                 estimatedTime: course.estimatedTime,
//                 shortDescription: course.shortDescription,
//                 longDescription: course.longDescription,
//                 createdAt: course.createdAt,
//                 status: course.status,
//                 visibility: course.visibility,
//                 courseOverview: course.courseOverview,
//                 thumbnail: course.thumbnail,
//                 categories: course.categories,
//                 seo: course.seo,
//               };
//             });

//             return response;
//           },
//         },
//       },
//       // Use a resolver chain to get the course offerings for each course
//       CourseCourseOffering: {
//         courseOfferings: {
//           resolve: async (parent, args, context) => {
//             // parent.id is the course id
//             const data = await strapi.services[
//               "api::course-offering.course-offering"
//             ].find({ filters: { course: parent.id } });

//             const response = data.results.map((course) => {
//               return {
//                 id: course.id,
//                 offeringTitle: course.offeringTitle,
//                 startDate: course.startDate,
//                 endDate: course.endDate,
//                 status: course.status,
//                 estimatedTime: course.estimatedTime,
//               };
//             });

//             return response;
//           },
//         },
//         instructors: {
//           resolve: async (parent, args, context) => {
//             // parent.id is the course id
//             const data = await strapi.services[
//               "api::instructor.instructor"
//             ].find({
//               filters: { courses: parent.id },
//               populate: {
//                 image: true,
//               },
//             });

//             const response = data.results.map((instructor) => {
//               return {
//                 id: instructor.id,
//                 name: instructor.name,
//                 credentials: instructor.credentials,
//                 image: instructor.image,
//                 about: instructor.about,
//               };
//             });

//             return response;
//           },
//         },
//       },
//     },
//     resolversConfig: {
//       "Query.courseSlug": {
//         auth: false,
//       },
//     },
//   }));
// }

// module.exports = {
//   findCourseBySlug,
// };
