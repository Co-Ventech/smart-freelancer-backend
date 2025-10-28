export const getUnixTimestamp = (secondsToSubtract = 0) => {
  return Math.floor(Date.now() / 1000) - secondsToSubtract;
};