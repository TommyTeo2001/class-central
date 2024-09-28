/**
 * This is a utility function that creates a user in the Strapi database. This automatically
 * assigns the user the "Authenticated" role and confirms the user's email.
 * @param {string} email - The email of the user
 * @param {string} first_name - The first name of the user
 * @param {string} last_name - The last name of the user
 */
async function createUser(email, first_name = "", last_name = "") {
  const tempPassword = Math.random().toString(36).slice(-8);
  return strapi.entityService.create("plugin::users-permissions.user", {
    data: {
      username: email,
      email: email,
      firstName: first_name,
      lastName: last_name,
      password: tempPassword,
      confirmed: true,
      provider: "local",
      blocked: false,
      emailConfirmation: true,
      role: {
        connect: [
          {
            id: 1,
            name: "Authenticated",
          },
        ],
      },
    },
  });
}

module.exports = {
  createUser,
};
