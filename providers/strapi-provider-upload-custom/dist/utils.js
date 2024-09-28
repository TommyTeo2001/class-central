"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCredentials = exports.isUrlFromBucket = void 0;
var ENDPOINT_PATTERN = /^(.+\.)?s3[.-]([a-z0-9-]+)\./;
function isUrlFromBucket(fileUrl, bucketName, baseUrl) {
    if (baseUrl === void 0) { baseUrl = ''; }
    var url = new URL(fileUrl);
    // Check if the file URL is using a base URL (e.g. a CDN).
    // In this case do not sign the URL.
    if (baseUrl) {
        return false;
    }
    var bucket = getBucketFromAwsUrl(fileUrl).bucket;
    if (bucket) {
        return bucket === bucketName;
    }
    // File URL might be of an S3-compatible provider. (or an invalid URL)
    // In this case, check if the bucket name appears in the URL host or path.
    // e.g. https://minio.example.com/bucket-name/object-key
    // e.g. https://bucket.nyc3.digitaloceanspaces.com/folder/img.png
    return url.host.startsWith("".concat(bucketName, ".")) || url.pathname.includes("/".concat(bucketName, "/"));
}
exports.isUrlFromBucket = isUrlFromBucket;
/**
 * Parse the bucket name from a URL.
 * See all URL formats in https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html
 *
 * @param {string} fileUrl - the URL to parse
 * @returns {object} result
 * @returns {string} result.bucket - the bucket name
 * @returns {string} result.err - if any
 */
function getBucketFromAwsUrl(fileUrl) {
    var url = new URL(fileUrl);
    // S3://<bucket-name>/<key>
    if (url.protocol === 's3:') {
        var bucket = url.host;
        if (!bucket) {
            return { err: "Invalid S3 url: no bucket: ".concat(url) };
        }
        return { bucket: bucket };
    }
    if (!url.host) {
        return { err: "Invalid S3 url: no hostname: ".concat(url) };
    }
    var matches = url.host.match(ENDPOINT_PATTERN);
    if (!matches) {
        return { err: "Invalid S3 url: hostname does not appear to be a valid S3 endpoint: ".concat(url) };
    }
    var prefix = matches[1];
    // https://s3.amazonaws.com/<bucket-name>
    if (!prefix) {
        if (url.pathname === '/') {
            return { bucket: null };
        }
        var index = url.pathname.indexOf('/', 1);
        // https://s3.amazonaws.com/<bucket-name>
        if (index === -1) {
            return { bucket: url.pathname.substring(1) };
        }
        // https://s3.amazonaws.com/<bucket-name>/
        if (index === url.pathname.length - 1) {
            return { bucket: url.pathname.substring(1, index) };
        }
        // https://s3.amazonaws.com/<bucket-name>/key
        return { bucket: url.pathname.substring(1, index) };
    }
    // https://<bucket-name>.s3.amazonaws.com/
    return { bucket: prefix.substring(0, prefix.length - 1) };
}
// TODO Remove this in V5 since we will only support the new config structure
var extractCredentials = function (options) {
    var _a, _b;
    // legacy
    if (options.accessKeyId && options.secretAccessKey) {
        return {
            accessKeyId: options.accessKeyId,
            secretAccessKey: options.secretAccessKey,
        };
    }
    // Legacy
    if (((_a = options.s3Options) === null || _a === void 0 ? void 0 : _a.accessKeyId) && options.s3Options.secretAccessKey) {
        process.emitWarning('Credentials passed directly to s3Options is deprecated and will be removed in a future release. Please wrap them inside a credentials object.');
        return {
            accessKeyId: options.s3Options.accessKeyId,
            secretAccessKey: options.s3Options.secretAccessKey,
        };
    }
    // V5
    if ((_b = options.s3Options) === null || _b === void 0 ? void 0 : _b.credentials) {
        return {
            accessKeyId: options.s3Options.credentials.accessKeyId,
            secretAccessKey: options.s3Options.credentials.secretAccessKey,
        };
    }
    return null;
};
exports.extractCredentials = extractCredentials;
