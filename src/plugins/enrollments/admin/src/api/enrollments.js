import { request } from "@strapi/helper-plugin";

const enrollmentRequest = {
  enrollAllUsers: async (userEnrollmentToBeAdded) => {
    return await request(`/enrollments/enrollAllUsers`, {
      method: "POST",
      body: userEnrollmentToBeAdded,
    });
  },
};

export default enrollmentRequest;
