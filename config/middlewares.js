module.exports = [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            `*.${process.env.DO_SPACE_REGION}.cdn.digitaloceanspaces.com`,
            `${process.env.DO_SPACE_BUCKET}.${process.env.DO_SPACE_REGION}.cdn.digitaloceanspaces.com`,
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            `*.${process.env.DO_SPACE_REGION}.cdn.digitaloceanspaces.com`,
            `${process.env.DO_SPACE_BUCKET}.${process.env.DO_SPACE_REGION}.cdn.digitaloceanspaces.com`,
          ],
          "frame-src": [
            "http://localhost:*",
            "self",
            "sandbox.embed.apollographql.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      headers: "*",
      origin: [
        `${process.env.CLIENT_PRODUCTION_URL}`,
        `${process.env.STRAPI_PRODUCTION_URL}`,
        `${process.env.STRAPI_STAGGING_URL}`,
        `${process.env.STRAPI_LOCAL_URL}`,
        `${process.env.CLIENT_LOCAL_URL}`,
        `https://cloud.scorm.com`,
        `http://localhost:3000`,
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  },
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  // "strapi::body",
  {
    name: "strapi::body",
    config: {
      includeUnparsed: true,
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
