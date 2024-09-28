module.exports = ({ env }) => ({
  sentry: {
    enabled: true,
    config: {
      dsn: env("NODE_ENV") === "production" ? env("SENTRY_DSN") : null,
      // dsn: env("SENTRY_DSN"),
      sendMetadata: true,
    },
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: env("SENDGRID_EMAIL_FROM"),
        defaultReplyTo: env("SENDGRID_EMAIL_TO"),
      },
    },
  },
  upload: {
    // Plugin for uploading files to DigitalOcean Spaces
    config: {
      provider: "strapi-provider-upload-do",
      providerOptions: {
        key: env("DO_SPACE_ACCESS_KEY"),
        secret: env("DO_SPACE_SECRET_KEY"),
        endpoint: env("DO_SPACE_BASE_URL"),
        space: env("DO_SPACE_BUCKET"),
        directory: "media", // optional
      },
      breakpoints: {
        medium: 750,
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  "course-upload": {
    enabled: false,
    resolve: "./src/plugins/course-upload",
  },
  enrollments: {
    enabled: true,
    resolve: "./src/plugins/enrollments",
  },
  graphql: {
    enabled: true,
    config: {
      playgroundAlways: false,
    },
  },
  "apollo-sandbox": {
    enabled: process.env.NODE_ENV === "production" ? false : true,
  },
  "list-tags": {
    enabled: true,
    resolve: "./src/plugins/list-tags",
  },
  "language-translations": {
    enabled: true,
    resolve: "./src/plugins/language-translations",
  },
});
