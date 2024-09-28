var getOr = require("lodash/fp");
var {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  PutObjectCommandInput,
  CompleteMultipartUploadCommandOutput,
  AbortMultipartUploadCommandOutput,
  S3ClientConfig,
  ObjectCannedACL,
} = require("@aws-sdk/client-s3");
var { AwsCredentialIdentity } = require("@aws-sdk/types");
var { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
var { Upload } = require("@aws-sdk/lib-storage");
var { extractCredentials, isUrlFromBucket } = require("./utils");

const assertUrlProtocol = (url) => {
  // Regex to test protocol like "http://", "https://"
  return /^\w*:\/\//.test(url);
};

const getConfig = ({ s3Options }) => {
  //   if (Object.keys(legacyS3Options).length > 0) {
  //     process.emitWarning(
  //       "S3 configuration options passed at root level of the plugin's providerOptions is deprecated and will be removed in a future release. Please wrap them inside the 's3Options:{}' property."
  //     );
  //   }
  const credentials = extractCredentials({ s3Options });
  const config = {
    ...s3Options,
    ...(credentials ? { credentials } : {}),
  };

  config.params.ACL = "public-read";

  return config;
};

module.exports = {
  init(providerOptions) {
    const { rootPath, s3Options, baseUrl } = providerOptions;
    // init your provider if necessary
    // TODO V5 change config structure to avoid having to do this
    const config = getConfig({
      s3Options,
    });
    const s3Client = new S3Client(config);
    const filePrefix = rootPath ? `${rootPath.replace(/\/+$/, "")}/` : "";

    const setFolderPath = async (file) => {
      // Query the folder to get it's folder name
      if (file.folderPath) {
        const folderRecord = await strapi.db
          .query("plugin::upload.folder")
          .findOne({ where: { path: file.folderPath } });
        if (!!folderRecord) {
          file["path"] = folderRecord.name;
        }
      }
    };

    const getFileKey = async (file) => {
      // Add folder name to file path
      await setFolderPath(file);
      const path = file.path ? `${file.path}/` : "";
      return `${filePrefix}${path}${file.hash}${file.ext}`;
    };

    const upload = async (file) => {
      const fileKey = await getFileKey(file);
      const uploadObj = new Upload({
        client: s3Client,
        params: {
          Bucket: config.params.Bucket,
          Key: fileKey,
          Body: file.stream || Buffer.from(file.buffer, "binary"),
          ACL: config.params.ACL,
          ContentType: file.mime,
        },
      });

      const upload = await uploadObj.done();

      if (assertUrlProtocol(upload.Location)) {
        file.url = baseUrl ? `${baseUrl}/${fileKey}` : upload.Location;
      } else {
        // Default protocol to https protocol
        file.url = `https://${upload.Location}`;
      }
    };

    return {
      isPrivate() {
        return config.params.ACL === "private";
      },

      async getSignedUrl(file, customParams) {
        // Do not sign the url if it does not come from the same bucket.
        if (!isUrlFromBucket(file.url, config.params.Bucket, baseUrl)) {
          return { url: file.url };
        }
        const fileKey = await getFileKey(file);
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: config.params.Bucket,
            Key: fileKey,
            ...customParams,
          }),
          {
            expiresIn: getOr(15 * 60, ["params", "signedUrlExpires"], config),
          }
        );

        return { url };
      },
      uploadStream(file) {
        return upload(file);
      },
      upload(file) {
        return upload(file);
      },
      async delete(file) {
        const fileKey = await getFileKey(file);
        const command = new DeleteObjectCommand({
          Bucket: config.params.Bucket,
          Key: fileKey,
        });
        return s3Client.send(command);
      },
    };
  },
};
