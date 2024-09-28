const path = require("path");
const AWS = require("aws-sdk");
var { Upload } = require("@aws-sdk/lib-storage");
var { S3Client } = require("@aws-sdk/client-s3");
const { findMineByFileExt } = require("../utils/general.js");
const { exec } = require("node:child_process");
const fs = require("fs");
const cheerio = require("cheerio");
const {
  xAPIScript,
  hotJarScript,
  missionControlScript,
  xAPIBookMarkScript,
  xAPIFunctionScript,
} = require("../utils/xAPIScript.js");

function getS3Config() {
  return new AWS.S3({
    accessKeyId: process.env.AWS_S3_SPACE_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SPACE_SECRET_KEY,
  });
}

// list all objects for a folder in AWS S3
// TODO: Delete all AWS implementations
async function listAllObjectsForFolder(prefix, continuationToken = null) {
  const s3Client = getS3Config();
  let command = null;
  if (continuationToken) {
    command = {
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    };
  } else {
    command = {
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: prefix,
    };
  }
  return await s3Client.listObjectsV2(command).promise();
}

// Delete file from AWS S3 objects
// TODO: Delete all AWS implementations
async function deleteFilesFromSpaces(folderKeys) {
  const s3Client = getS3Config();
  const deleteKeyPromises = [];
  const batchSize = 300;
  const objectKeyBatches = [];

  for (let i = 0; i < folderKeys.length; i += batchSize) {
    objectKeyBatches.push(folderKeys.slice(i, i + batchSize));
  }

  // Delete all objects within the folder
  for (const batch of objectKeyBatches) {
    const deleteObjectsCommand = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: {
        Objects: batch.map((key) => ({ Key: key })),
      },
    };
    const deleteObjectPromise = s3Client
      .deleteObjects(deleteObjectsCommand)
      .promise();
    deleteKeyPromises.push(deleteObjectPromise);
  }

  return await Promise.all(deleteKeyPromises);
}
// Tracking function for xAPI statements
// TODO: Delete all AWS implementations
const addXAPITrackingFunction = (file) => {
  const modifiedContent = fs.readFileSync(file.path, "utf8");
  return modifiedContent.replace(
    "var PROGRESSED = 'http://adlnet.gov/expapi/verbs/progressed';",
    xAPIFunctionScript
  );
};
// Tracking for general xAPI statements
const addXAPITracking = (file) => {
  // const modifiedContent = fs.readFileSync(file.path, "utf8");
  return file.replace("function sendStatement(attribs) {", xAPIScript);
};
// Tracking for bookmark (last visited page)
// This should run before the addXAPITracking function
const addXAPIBookMarkTracking = (file) => {
  return file.replace("function SetBookmark(data) {", xAPIBookMarkScript);
};
// Add hotjar script to index.html
const addHTMLScript = (file, scripts) => {
  const fileContent = fs.readFileSync(file.path, "utf8");
  const $ = cheerio.load(fileContent);
  const $head = $("head");
  scripts.forEach((script) => {
    $head.append(script);
  });
  return $.html();
};

// Upload file to AWS S3 objects
// TODO: Delete all AWS implementations
async function uploadFilesToSpaces(
  ctx,
  files,
  withXApiTracking,
  withHotJarTracking,
  withMissionControl
) {
  const s3Client = getS3Config();
  const uploadPromises = [];
  // Consolidate all file errors
  const filesWithErrors = [];

  for (const file of files) {
    const fileName = file.name;
    if (!fs.existsSync(file.path)) {
      filesWithErrors.push({
        fileName,
        error: "File does not exist on you local machine",
      });
    } else {
      let fileContent = null;
      if (withXApiTracking === "true" && file.name.match(/\/lib\/lms\.js/i)) {
        // add xAPI tracking
        fileContent = addXAPITrackingFunction(file);
        fileContent = addXAPITracking(fileContent);
        fileContent = addXAPIBookMarkTracking(fileContent);
      } else if (file.name.match(/index\.html/i)) {
        let scriptsToAdd = [];
        if (withHotJarTracking === "true") {
          // add hotjar tracking
          scriptsToAdd.push(hotJarScript);
        }
        if (withMissionControl === "true") {
          // add mission control tracking
          scriptsToAdd.push(missionControlScript);
        }
        fileContent = addHTMLScript(file, scriptsToAdd);
      } else {
        fileContent = fs.readFileSync(file.path);
      }
      // TODO: This is subject to change
      const fileKey = "myFullerEquipClassroom/courses/" + fileName;
      const fileContentType = findMineByFileExt(path.extname(fileName));

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        Body: fileContent,
        ContentType: fileContentType,
      };
      const uploadPromise = s3Client.upload(uploadParams).promise();
      uploadPromises.push(uploadPromise);
    }
  }

  try {
    // TODO: Return errors if there are any
    return await Promise.all(uploadPromises);
  } catch (error) {
    return ctx.send({
      status: 400,
      data: [],
      error: {
        message: "There was a problem uploading articulate course." + error,
      },
    });
  }
}

module.exports = {
  getS3Config,
  uploadFilesToSpaces,
  listAllObjectsForFolder,
  deleteFilesFromSpaces,
};
