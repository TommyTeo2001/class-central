import { request } from "@strapi/helper-plugin";

const courseUploadRequest = {
  find: async () => {
    return await request("/course-upload/find", {
      method: "GET",
    });
  },
  createArticulateCourse: async (data) => {
    return await fetch("/course-upload/createArticulateCourse", {
      method: "POST",
      body: data,
    });
  },
  create: async (data) => {
    return await request("/course-upload/create", {
      method: "POST",
      body: { data: data },
    });
  },
  delete: async (folderName, id, courseId) => {
    return await request(`/course-upload/delete/${folderName}/${id}`, {
      method: "DELETE",
    });
  },
};

export default courseUploadRequest;
