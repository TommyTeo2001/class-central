module.exports = {
  beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    const timestamp = Date.now(); // Get current timestamp in milliseconds
    const random = Math.floor(Math.random() * 10000); // Generate random integer between 0 and 999999
    // Generate a random number between min and max
    const min = 1000;
    const max = 100000;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    event.params.data.jobNumber = parseInt(`${timestamp}${randomNumber}`)
      .toString()
      .substr(5, 6);
  },
  async beforeUpdate(event) {
    //const { data, where, select, populate } = event.params;
  },
};
