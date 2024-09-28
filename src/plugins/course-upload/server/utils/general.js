const mimeDb = require("mime-db");
var {
  extractCredentials,
} = require("strapi-provider-upload-custom/dist/utils.js");
var fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
var { Upload } = require("@aws-sdk/lib-storage");
var { S3Client } = require("@aws-sdk/client-s3");

// Find mime by file extension type
function findMineByFileExt(file) {
  for (const mimeType in mimeDb) {
    const { extensions } = mimeDb[mimeType];
    const fileExt = file.substring(file.lastIndexOf(".") + 1) || "";
    if (!!extensions && extensions.includes(fileExt)) {
      return mimeType;
    }
  }
}

// fucntion for camel casing a string
function camelCase(str) {
  return str
    .replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase();
    })
    .replace(/\s/g, "")
    .replace(/^(.)/, function ($1) {
      return $1.toLowerCase();
    });
}

function extractFilesAndFolders(allFiles, folderPath, currentPath = "") {
  const items = fs.readdirSync(folderPath);
  items.forEach((item) => {
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);
    const fullPath = path.join(currentPath, item);
    const hiddenFolder =
      !fullPath.includes("__MACOSX") && !fullPath.includes(".DS_Store");

    if (stats.isFile() && hiddenFolder) {
      allFiles.push({ name: item, path: fullPath });
    } else if (stats.isDirectory() && hiddenFolder) {
      extractFilesAndFolders(allFiles, itemPath, fullPath);
    }
  });
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes / (1024 * 1024);
  } catch (error) {
    return null;
  }
}

module.exports = {
  findMineByFileExt,
  camelCase,
  extractFilesAndFolders,
  getFileSize,
};
