import qs from "qs";
import { request } from "@strapi/helper-plugin";

const courseOfferingRequest = {
  findAll: async () => {
    return await request(`/enrollments/allCourseOfferings`, {
      method: "GET",
    });
  },
};

export default courseOfferingRequest;
