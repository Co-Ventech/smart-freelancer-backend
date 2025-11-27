// New: determine "new" vs "old" projects and constants
export const NEW_THRESHOLD_SECONDS = 60;
export const OLDER_THRESHOLD_SECONDS= 300;

export const isProjectNew = (submitUnixSeconds, nowUnix = Math.floor(Date.now() / 1000)) => {
  if (!submitUnixSeconds || Number.isNaN(submitUnixSeconds)) return false;
  const difference= (nowUnix - submitUnixSeconds);
  console.log(difference);
  return ((difference <= NEW_THRESHOLD_SECONDS) && (difference>=0));
};

export const isProjectOlder = (submitUnixSeconds, nowUnix = Math.floor(Date.now() / 1000)) => {
  if (!submitUnixSeconds || Number.isNaN(submitUnixSeconds)) return false;
  const difference= (nowUnix - submitUnixSeconds);
  console.log(difference);
  return ((difference <= OLDER_THRESHOLD_SECONDS) && (difference>NEW_THRESHOLD_SECONDS));
};