import * as vscode from "vscode";
import * as statusBar from "./statusBar";
import { fetchUsageSummary } from "./cursor-api";
import {
  CONFIG_SECTION,
  DEFAULT_POLLING_INTERVAL_IN_MINUTES,
  POLLING_INTERVAL_CONFIG_KEY,
  REFRESH_USAGE_COMMAND,
  SET_POLLING_INTERVAL_COMMAND,
  TOGGLE_DISPLAY_MODE_COMMAND,
} from "./constants";

let refreshTimer: NodeJS.Timeout | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  statusBar.createStatusBarItem(context);

  const refreshUsageCmd = vscode.commands.registerCommand(
    REFRESH_USAGE_COMMAND,
    () => refreshUsage(context),
  );

  const setPollingIntervalCmd = vscode.commands.registerCommand(
    SET_POLLING_INTERVAL_COMMAND,
    () => setPollingInterval(context),
  );

  const toggleDisplayModeCmd = vscode.commands.registerCommand(
    TOGGLE_DISPLAY_MODE_COMMAND,
    () => statusBar.toggleDisplayMode(),
  );

  context.subscriptions.push(
    statusBar.getStatusBarItem(),
    refreshUsageCmd,
    setPollingIntervalCmd,
    toggleDisplayModeCmd,
  );

  refreshUsage(context);
  setupRefreshTimer(context);
}

/**
 * Fetches usage summary from the Cursor API and updates the status bar.
 */
async function refreshUsage(context: vscode.ExtensionContext): Promise<void> {
  try {
    const summary = await fetchUsageSummary();
    const bucket =
      summary.individualUsage.overall ||
      summary.individualUsage.plan ||
      summary.individualUsage.onDemand;

    console.log(
      `[Cursor Credits Usage] Used: ${bucket.used}, Remaining: ${bucket.remaining}, Limit: ${bucket.limit}`,
    );

    statusBar.updateStatusBar(bucket, summary.billingCycleEnd);
  } catch (error: any) {
    const isAuthError =
      error.message?.includes("HTTP 401") ||
      error.message?.includes("HTTP 403");

    if (isAuthError) {
      statusBar.setUnauthenticated();
    } else {
      statusBar.setError("Refresh Failed");
    }
  }
}

/**
 * Sets the polling interval for the usage data refresh.
 */
async function setPollingInterval(
  context: vscode.ExtensionContext,
): Promise<void> {
  const current = vscode.workspace
    .getConfiguration(CONFIG_SECTION)
    .get<number>(
      POLLING_INTERVAL_CONFIG_KEY,
      DEFAULT_POLLING_INTERVAL_IN_MINUTES,
    );

  const input = await vscode.window.showInputBox({
    prompt: "How often to refresh usage data (in minutes)",
    placeHolder: "Enter a number",
    value: String(current),
    validateInput: (text) => {
      const num = parseInt(text, 10);
      return isNaN(num) || num <= 0 ? "Please enter a valid number." : null;
    },
  });

  if (input !== undefined) {
    await vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .update(
        POLLING_INTERVAL_CONFIG_KEY,
        parseInt(input, 10),
        vscode.ConfigurationTarget.Global,
      );
    vscode.window.showInformationMessage(
      `Polling interval for auto refresh set to ${input} minutes.`,
    );
    setupRefreshTimer(context);
  }
}

function setupRefreshTimer(context: vscode.ExtensionContext): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  const pollMinutes = vscode.workspace
    .getConfiguration(CONFIG_SECTION)
    .get<number>(
      POLLING_INTERVAL_CONFIG_KEY,
      DEFAULT_POLLING_INTERVAL_IN_MINUTES,
    );

  const intervalMs = pollMinutes * 60 * 1000;

  refreshTimer = setInterval(() => {
    refreshUsage(context);
  }, intervalMs);
}

// This method is called when your extension is deactivated
export function deactivate() {}
