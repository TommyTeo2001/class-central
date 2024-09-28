/**
 * Find a course offering by slug
 * @param {Object} extensionService - The extension service
 */
function findCourseOfferingBySlug(extensionService) {
  extensionService.use(({ nexus }) => ({
    typeDefs: `
            type Query {
              courseOfferingSlug(slug: String! locale: String): [CourseCourseOffering]
            }
      
            type Lesson {
              id: ID!
              lessonName: String
              lessonDescription: String
            }
      
            type CourseOverview {
              id: ID!
              sectionTitle: String
              lessons: [Lesson]
            }
      
            type thumbnail {
              id: ID!
              url: String
              formats: JSON
              alternativeText: String
            }
      
            type Categories {
              id: ID!
              name: String!
            }
      
            type instructor {
              id: ID!
              name: String!
              credentials: String
              image: thumbnail
              about: String
            }
      
            type Seo {
              id: ID!
              metaTitle: String!
              metaDescription: String!
              keywords: String
              metaRobots: String
              structuredData: JSON
              metaViewport: String
              canonicalURL: String
            }
      
            type CourseCourseOffering {
              id: ID!
              offeringTitle: String!
              slug: String!
              instructors: [instructor]
              estimatedTime: String
              shortDescription: String
              longDescription: String
              startDate: String
              endDate: String
              coursePrice: Float
              createdAt: String!
              status: String
              visibility: String
              courseOverview: [CourseOverview]
              thumbnail: thumbnail
              categories: [Categories]
              seo: Seo
              discountPercentagePrice: Float
              stripeProductId: String
              stripePriceId: String
              locale: String
            }
            `,
    resolvers: {
      Query: {
        courseOfferingSlug: {
          resolve: async (parent, args, context) => {
            const data = await strapi.services[
              "api::course-offering.course-offering"
            ].find({
              filters: { slug: args.slug },
              locale: args.locale ?? "en",
              populate: {
                courseOverview: {
                  populate: {
                    lessons: true,
                  },
                },
                thumbnail: true,
                categories: true,
                seo: true,
              },
            });

            const response = data.results.map((courseOffering) => {
              return {
                id: courseOffering.id,
                offeringTitle: courseOffering.offeringTitle,
                slug: courseOffering.slug,
                coursePrice: courseOffering.coursePrice,
                instructors: courseOffering.instructors,
                estimatedTime: courseOffering.estimatedTime,
                shortDescription: courseOffering.shortDescription,
                longDescription: courseOffering.longDescription,
                createdAt: courseOffering.createdAt,
                startDate: courseOffering.startDate,
                endDate: courseOffering.endDate,
                status: courseOffering.status,
                visibility: courseOffering.visibility,
                courseOverview: courseOffering.courseOverview,
                thumbnail: courseOffering.thumbnail,
                categories: courseOffering.categories,
                seo: courseOffering.seo,
                discountPercentagePrice: courseOffering.discountPercentagePrice,
                stripeProductId: courseOffering.stripeProductId,
                stripePriceId: courseOffering.stripePriceId,
                locale: courseOffering.locale,
              };
            });
            return response;
          },
        },
      },
      // Use a resolver chain to get the course offerings for each course
      CourseCourseOffering: {
        instructors: {
          resolve: async (parent, args, context) => {
            // parent.id is the course offering id
            const data = await strapi.services[
              "api::instructor.instructor"
            ].find({
              filters: { courseOfferings: parent.id },
              populate: {
                image: true,
              },
              locale: parent.locale,
            });

            const response = data.results.map((instructor) => {
              return {
                id: instructor.id,
                name: instructor.name,
                credentials: instructor.credentials,
                image: instructor.image,
                about: instructor.about,
              };
            });

            return response;
          },
        },
      },
    },
    resolversConfig: {
      "Query.courseOfferingSlug": {
        auth: false,
      },
    },
  }));
}

module.exports = { findCourseOfferingBySlug };
