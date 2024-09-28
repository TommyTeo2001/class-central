/**
 * Helper function to check if promise.allsettled returned any rejected results
 */
function isAnyRejected(results) {
  return results.some((result) => result.status === "rejected");
}

module.exports = {
  isAnyRejected,
};
