/**
 *  Find classroom by slug
 * @param extensionService
 */
function findClassroomBySlug(extensionService) {
  extensionService.use(({ nexus }) => ({
    typeDefs: `
            type Query {
              classroomSlug(slug: String! locale: String): [ClassroomClassroomOffering]
            }

            type ReflectionItem {
              id: ID!
              itemTitle: String!
              itemDescription: String!
            }

            type Reflection {
              id: ID!
              title: String!
              description: String
              reflectionItems: [ReflectionItem]
            }

            type LearningComponent {
              id: ID!
              courseOfferingId: ID!
              courseOfferingTitle: String!
              courseOfferingStartDate: String
              courseOfferingEndDate: String
              courseOfferingStatus: String
              courseOfferingEstimatedTime: String
            }
      
            type classroomOffering {
              id: ID!
              offeringTitle: String!
              startDate: String
              endDate: String
              status: String
              about: String
              learnersView: Boolean
              numberOfSeats: Int
              groupPurchase: Boolean
              learningComponents: [LearningComponent]
              locale: String
            }
      
            type thumbnail {
              id: ID!
              url: String
              formats: JSON
              alternativeText: String
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

            type localeAvailable {
              locale: String
              name: String
            }
      
            type ClassroomClassroomOffering {
              id: ID!
              classroomTitle: String!
              visibility: String!
              shortDescription: String
              longDescription: String
              estimatedTime: String
              thumbnail: thumbnail
              classRoomPrice: Float
              slug: String
              status: String
              instructors: [instructor]
              classroomOfferings: [classroomOffering]
              seo: Seo
              classroomComponents: JSON
              discountPercentagePrice: Float
              stripeProductId: String
              stripePriceId: String
              groupPurchase: Boolean
              locale: String
              numberOflocalesAvailable: [localeAvailable]
            }
            `,
    resolvers: {
      Query: {
        classroomSlug: {
          resolve: async (parent, args, context) => {
            const data = await strapi.services["api::classroom.classroom"].find(
              {
                filters: { slug: args.slug },
                locale: "all",
                populate: {
                  thumbnail: true,
                  categories: true,
                  seo: true,
                  ClassroomComponents: {
                    populate: {
                      reflectionItems: true,
                      courseOffering: {
                        fields: [
                          "id",
                          "slug",
                          "offeringTitle",
                          "startDate",
                          "endDate",
                          "status",
                          "estimatedTime",
                          "longDescription",
                          "shortDescription",
                        ],
                        populate: {
                          instructors: true,
                        },
                      },
                    },
                  },
                },
              }
            );

            // Find the classroom with the same locale
            const filteredClassroom = data.results.filter((classroom) => {
              return classroom.locale === (args.locale || "en");
            });

            const alllocales = await strapi.entityService.findMany(
              "plugin::i18n.locale"
            );
            const classroomLocales = data.results.map(
              (classroom) => classroom.locale
            );

            const availableLocales = alllocales
              .filter((locale) => classroomLocales.includes(locale.code))
              .map((locale) => ({ locale: locale.code, name: locale.name }));

            const response = filteredClassroom.map((classroom) => {
              return {
                id: classroom.id,
                classroomTitle: classroom.classroomTitle,
                shortDescription: classroom.shortDescription,
                longDescription: classroom.longDescription,
                visibility: classroom.visibility,
                estimatedTime: classroom.estimatedTime,
                classRoomPrice: classroom.classRoomPrice,
                slug: classroom.slug,
                status: classroom.status,
                thumbnail: classroom.thumbnail,
                seo: classroom.seo,
                classroomComponents: classroom?.ClassroomComponents,
                discountPercentagePrice: classroom.discountPercentagePrice,
                stripeProductId: classroom.stripeProductId,
                stripePriceId: classroom.stripePriceId,
                groupPurchase: classroom.groupPurchase,
                locale: classroom.locale,
                numberOflocalesAvailable: availableLocales,
              };
            });

            return response;
          },
        },
      },
      // Use a resolver chain to get the course offerings
      ClassroomClassroomOffering: {
        classroomOfferings: {
          resolve: async (parent, args, context) => {
            // parent.id is the classroom id
            const data = await strapi.services[
              "api::classroom-offering.classroom-offering"
            ].find({
              filters: { classroom: parent.id },
              populate: {
                learningComponents: {
                  fields: ["id"],
                  populate: {
                    courseOffering: true,
                  },
                },
              },
              locale: parent.locale,
            });
            const response = data.results.map((offering) => {
              // Get learning components for each offering
              const learningComponents = offering?.learningComponents
                .map((component) => {
                  if (component?.courseOffering) {
                    return {
                      id: component.id,
                      courseOfferingId: component.courseOffering.id,
                      courseOfferingTitle:
                        component.courseOffering.offeringTitle,
                      courseOfferingStartDate:
                        component.courseOffering.startDate,
                      courseOfferingEndDate: component.courseOffering.endDate,
                      courseOfferingStatus: component.courseOffering.status,
                      courseOfferingEstimatedTime:
                        component.courseOffering.estimatedTime,
                    };
                  }
                })
                .filter(Boolean);
              return {
                id: offering.id,
                offeringTitle: offering.offeringTitle,
                startDate: offering.startDate,
                endDate: offering.endDate,
                status: offering.status,
                about: offering.about,
                numberOfSeats: offering.numberOfSeats,
                groupPurchase: offering.groupPurchase,
                learningComponents: [...learningComponents],
                locale: offering.locale,
              };
            });

            return response;
          },
        },
      },
    },
    resolversConfig: {
      "Query.classroomSlug": {
        auth: false,
      },
    },
  }));
}

module.exports = {
  findClassroomBySlug,
};
