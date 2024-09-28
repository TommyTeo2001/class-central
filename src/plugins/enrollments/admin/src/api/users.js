import { request } from "@strapi/helper-plugin";

const userRequest = {
  findAll: async (start) => {
    return await request(`/enrollments/users`, {
      method: "GET",
    });
  },
};

export default userRequest;
