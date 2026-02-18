const REFRESH_USAGE_COMMAND = "cursor-credits-usage.refreshUsage";
const SET_POLLING_INTERVAL_COMMAND = "cursor-credits-usage.setPollingInterval";
const TOGGLE_DISPLAY_MODE_COMMAND = "cursor-credits-usage.toggleDisplayMode";

const DEFAULT_POLLING_INTERVAL_IN_MINUTES = 3;
const POLLING_INTERVAL_CONFIG_KEY = "pollIntervalMinutes";

const CONFIG_SECTION = "cursorCreditsUsage";

export {
  REFRESH_USAGE_COMMAND,
  SET_POLLING_INTERVAL_COMMAND,
  TOGGLE_DISPLAY_MODE_COMMAND,
  DEFAULT_POLLING_INTERVAL_IN_MINUTES,
  POLLING_INTERVAL_CONFIG_KEY,
  CONFIG_SECTION,
};
