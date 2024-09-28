/**
 *  Add first and last names to the User collection
 * @param extensionService
 */
function addFirstLastNamesToUserCollection(extensionService) {
  extensionService.use(({ nexus }) => ({
    types: [
      nexus.extendType({
        type: "UsersPermissionsMe",
        definition(t) {
          t.string("firstName");
          t.string("lastName");
          t.string("createdAt");
          t.boolean("emailConfirmation");
        },
      }),
    ],
  }));
}

module.exports = {
  addFirstLastNamesToUserCollection,
};
