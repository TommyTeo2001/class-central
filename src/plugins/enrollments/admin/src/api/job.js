import qs from "qs";
import { request } from "@strapi/helper-plugin";

const jobRequest = {
  findJobsByIds: async (jobIds) => {
    return await request(`/enrollments/jobByIds`, {
      method: "POST",
      body: jobIds,
    });
  },
};
export default jobRequest;
