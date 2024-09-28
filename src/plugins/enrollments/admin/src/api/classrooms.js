import { request } from "@strapi/helper-plugin";
import qs from "qs";

const classroomRequest = {
  findAll: async () => {
    const query = qs.stringify(
      {
        fields: [
          "id",
          "offeringTitle",
          "classroomAndclassroomOffering",
          "groupPurchase",
        ],
        populate: {
          classroom: {
            fields: ["id", "classroomTitle", "groupPurchase"],
          },
        },
      },
      {
        encodeValuesOnly: true,
      }
    );

    return await fetch(`/api/classroom-offerings?${query}&locale=all`, {
      method: "GET",
    });
  },
  search: async (title) => {
    const query = qs.stringify(
      {
        fields: ["id", "offeringTitle"],
        filters: {
          classroomTitle: {
            $contains: title,
          },
        },
      },
      {
        encodeValuesOnly: true,
      }
    );

    return await fetch(`/api/classroom-offerings?${query}`, {
      method: "GET",
    });
  },
};

export default classroomRequest;
