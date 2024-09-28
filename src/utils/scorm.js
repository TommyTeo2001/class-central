// Update this to folder upload
function createUserRegistration(requestData) {
  const authHeader =
    "Basic " + btoa(`${process.env.SCORM_APP_ID}:${process.env.SCORM_API_KEY}`);
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };
  return fetch(`${process.env.SCORM_REGISTRATION_URL}`, requestOptions);
}

module.exports = {
  createUserRegistration,
};
