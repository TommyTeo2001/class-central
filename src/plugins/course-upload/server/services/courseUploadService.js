"use strict";
const { camelCase } = require("../utils/general.js");
const {
  uploadFilesToSpaces,
  listAllObjectsForFolder,
  deleteFilesFromSpaces,
} = require("../services/helperFunctions.js");
const { getFileSize } = require("../utils/general.js");
//TODO: Added sending errors to sentry

module.exports = ({ strapi }) => ({
  async find(query) {
    return await strapi.entityService.findMany(
      "plugin::course-upload.courseupload",
      { sort: { createdAt: "desc" } }
    );
  },
  async createArticulateCourse(ctx, files, body) {
    const {
      folderNameAWS,
      withXApiTracking,
      withHotJarTracking,
      withMissionControl,
    } = body;
    const { multiFiles } = files;

    try {
      const commandResponse = await listAllObjectsForFolder(
        "myFullerEquipClassroom/courses/" + folderNameAWS
      );
      if (!!commandResponse.KeyCount) {
        return ctx.send({
          status: 400,
          data: [],
          error: {
            message:
              "An articulate folder has already been uploaded for this Course. Please select a different folder or delete the existing folder and try again.",
          },
        });
      }
    } catch (error) {
      return ctx.send({
        status: 400,
        data: [],
        error: {
          message:
            "There was a problem with your request. Please try again later." +
            error,
        },
      });
    }

    try {
      const responses = await uploadFilesToSpaces(
        ctx,
        multiFiles,
        withXApiTracking,
        withHotJarTracking,
        withMissionControl
      );
      if (responses.length > 0 && !!responses[0]?.ETag) {
        const indexResponse = responses.find((response) => {
          return response.Location.includes("/index.html");
        });
        const courseUploadUrl = indexResponse?.Location;
        return ctx.send({
          status: 200,
          data: {
            courseUploadUrl: courseUploadUrl,
          },
        });
      }
      return ctx.send({
        status: 400,
        data: {
          hasIndexHtmlFile: responses?.hasIndexHtmlFile,
        },
        error: {
          message: "There was a problem uploading articulate course.",
        },
      });
    } catch (error) {
      return ctx.send({
        status: 400,
        data: [],
        error: {
          message:
            "There was an issue uploading the course. Please try again later." +
            error,
        },
      });
    }
  },

  async create(data) {
    return await strapi.entityService.create(
      "plugin::course-upload.courseupload",
      data
    );
  },

  async delete(ctx, folderName, id) {
    try {
      let listObjects = [];
      let continuationToken = null;
      do {
        const listObjectsResponse = await listAllObjectsForFolder(
          "myFullerEquipClassroom/courses/" + folderName,
          continuationToken
        );
        if (!!listObjectsResponse.Contents) {
          listObjects = listObjects.concat(listObjectsResponse.Contents);
          continuationToken = listObjectsResponse.NextContinuationToken;
        }
      } while (continuationToken);

      // If there are no objects in the folder, delete the folder in the database
      if (listObjects.length === 0) {
        return await strapi.entityService.delete(
          "plugin::course-upload.courseupload",
          id
        );
      }
      const folderKeys = listObjects.map((object) => object.Key);

      const keyDeleteResponse = await deleteFilesFromSpaces(folderKeys);
      if (!!keyDeleteResponse && keyDeleteResponse[0]?.Deleted.length > 0) {
        return await strapi.entityService.delete(
          "plugin::course-upload.courseupload",
          id
        );
      } else {
        return ctx.send({
          status: 400,
          data: [],
          error: {
            message:
              "There was a problem deleting the course upload, please try again later.",
          },
        });
      }
    } catch (error) {
      return ctx.send({
        status: 400,
        data: [],
        error: {
          message:
            "There was a problem deleting the course upload, please try again.",
        },
      });
    }
  },
});
