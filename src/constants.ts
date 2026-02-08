const CAPTURE_COOKIE_COMMAND = "cursor-credits-usage.captureCookie";
const REFRESH_USAGE_COMMAND = "cursor-credits-usage.refreshUsage";
const SET_POLLING_INTERVAL_COMMAND = "cursor-credits-usage.setPollingInterval";

const COOKIE_STORAGE_KEY = "cursor-credits-usage.user.web-session.cookie";
const DEFAULT_POLLING_INTERVAL_IN_MINUTES = 5;
const POLLING_INTERVAL_CONFIG_KEY = "pollIntervalMinutes";

const CONFIG_SECTION = "cursorCreditsUsage";

export {
  REFRESH_USAGE_COMMAND,
  CAPTURE_COOKIE_COMMAND,
  SET_POLLING_INTERVAL_COMMAND,
  COOKIE_STORAGE_KEY,
  DEFAULT_POLLING_INTERVAL_IN_MINUTES,
  POLLING_INTERVAL_CONFIG_KEY,
  CONFIG_SECTION,
};
