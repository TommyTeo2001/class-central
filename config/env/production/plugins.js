module.exports = ({ env }) => ({
  sentry: {
    enabled: true,
    config: {
      dsn: env("NODE_ENV") === "production" ? env("SENTRY_DSN") : null,
      // dsn: env("SENTRY_DSN"),
      sendMetadata: true,
    },
  },
  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 30,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
        introspection: true,
      },
    },
  },
  upload: {
    // Plugin for uploading files to DigitalOcean Spaces
    config: {
      provider: "strapi-provider-upload-custom",
      providerOptions: {
        baseUrl: env("DO_SPACE_BASE_URL"),
        rootPath: env("DO_SPACE_ROOT_PATH"),
        s3Options: {
          accessKeyId: env("DO_SPACE_ACCESS_KEY"),
          secretAccessKey: env("DO_SPACE_SECRET_KEY"),
          endpoint: env("DO_SPACE_ENDPOINT"),
          region: env("DO_SPACE_REGION"),
          params: {
            Bucket: env("DO_SPACE_BUCKET"),
            ACL: "public-read",
          },
        },
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
});
