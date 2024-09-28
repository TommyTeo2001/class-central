const { errors } = require("@strapi/utils");
const { ApplicationError, ForbiddenError } = errors;
var _ = require("lodash");
const { checkContentData } = require("../../../../utils/collectionTypes");

module.exports = {
  async beforeUpdate(event) {
    const { data, where, select, populate } = event.params;
    // Set classroomAndclassroomOffering field when classroom has been added
    if (
      data?.classroom?.connect.length > 0 &&
      data?.classroom?.connect[0]?.id
    ) {
      const classroomId = data?.classroom?.connect[0]?.id;
      const classroom = await strapi.entityService.findOne(
        "api::classroom.classroom",
        classroomId
      );
      if (classroom) {
        data.classroomAndclassroomOffering =
          classroom.classroomTitle + " - " + data.offeringTitle;
      }
    }
    // When we have disconnect and no connect, delete the classroomAndclassroomOffering field
    if (
      data?.classroom?.disconnect.length > 0 &&
      data?.classroom?.connect.length === 0
    ) {
      data.classroomAndclassroomOffering = null;
    }

    // If updates are made check and update the classroomAndclassroomOffering field
    if (
      data?.classroom?.connect.length === 0 &&
      data?.classroom?.disconnect.length === 0
    ) {
      const classroomOfferingId = where.id;
      const classroomOffering = await strapi.entityService.findOne(
        "api::classroom-offering.classroom-offering",
        classroomOfferingId,
        {
          populate: ["classroom"],
        }
      );

      if (classroomOffering.classroom) {
        data.classroomAndclassroomOffering =
          classroomOffering.classroom.classroomTitle +
          " - " +
          data.offeringTitle;
      }
    }

    // if (!!data.publishedAt && !!where.id) {
    //   const courseOfferingId = where.id;
    //   const courseOffering = await strapi.entityService.findOne(
    //     "api::course-offering.course-offering",
    //     courseOfferingId,
    //     {
    //       populate: ["course"],
    //     }
    //   );
    //   if (!courseOffering.course) {
    //     throw new ApplicationError(
    //       "A Course Offering cannot be published without a Course.",
    //       400
    //     );
    //     return;
    //   }
    // }

    // Course is removed after being published
    if (data.id) {
      // const classroomOfferingId = data.id;
      // const classroomOffering = await strapi.entityService.findOne(
      //   "api::classroom-offering.classroom-offering",
      //   classroomOfferingId,
      //   {
      //     populate: ["classroom"],
      //   }
      // );

      //   if (
      //     classroomOffering.publishedAt &&
      //     data.course.disconnect.length === 1 &&
      //     data.course.connect.length === 0
      //   ) {
      //     const checkedData = checkContentData(data, ["course"]);
      //     if (!checkedData.course) {
      //       throw new ApplicationError(
      //         "A Course Offering cannot be published without a Course.",
      //         400
      //       );
      //     }
      //   }

      // If end date is set, start date must be set
      if (data) {
        if (data?.endDate && !data?.startDate) {
          throw new ApplicationError(
            "A Classroom Offering cannot have an end date without a start date.",
            400
          );
        }

        // Check if start date is before end date
        if (data?.endDate && data?.startDate) {
          const startDate = new Date(data?.startDate);
          const endDate = new Date(data?.endDate);
          if (startDate > endDate) {
            throw new ApplicationError(
              "A Classroom Offering cannot have an end date before the start date.",
              400
            );
          }
        }
      }
    }
  },
  async beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    // Set classroomAndclassroomOffering field when classroom has been added
    if (
      data?.classroom?.connect.length > 0 &&
      data?.classroom?.connect[0]?.id
    ) {
      const classroomId = data?.classroom?.connect[0]?.id;
      const classroom = await strapi.entityService.findOne(
        "api::classroom.classroom",
        classroomId
      );
      if (classroom) {
        data.classroomAndclassroomOffering =
          classroom.classroomTitle + " - " + data.offeringTitle;
      }
    }
  },
};
