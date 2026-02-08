import * as vscode from "vscode";
import * as statusBar from "./statusBar";
import { fetchUsageSummary } from "./cursor-api";
import {
  CAPTURE_COOKIE_COMMAND,
  CONFIG_SECTION,
  COOKIE_STORAGE_KEY,
  DEFAULT_POLLING_INTERVAL_IN_MINUTES,
  POLLING_INTERVAL_CONFIG_KEY,
  REFRESH_USAGE_COMMAND,
  SET_POLLING_INTERVAL_COMMAND,
} from "./constants";

let refreshTimer: NodeJS.Timeout | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  statusBar.createStatusBarItem();

  const captureCookieCmd = vscode.commands.registerCommand(
    CAPTURE_COOKIE_COMMAND,
    () => captureCookie(context),
  );

  const refreshUsageCmd = vscode.commands.registerCommand(
    REFRESH_USAGE_COMMAND,
    () => refreshUsage(context),
  );

  const setPollingIntervalCmd = vscode.commands.registerCommand(
    SET_POLLING_INTERVAL_COMMAND,
    () => setPollingInterval(context),
  );

  context.subscriptions.push(
    statusBar.getStatusBarItem(),
    captureCookieCmd,
    refreshUsageCmd,
    setPollingIntervalCmd,
  );

  refreshUsage(context);
  setupRefreshTimer(context);
}

/**
 * Prompts the user for their WorkosCursorSessionToken cookie value
 * and stores it in VS Code's SecretStorage.
 */
async function captureCookie(context: vscode.ExtensionContext): Promise<void> {
  try {
    const cookieValue = await vscode.window.showInputBox({
      prompt:
        "Enter your WorkosCursorSessionToken cookie value. (Login to cursor.com and open the developer tools. Go to Application -> Cookies -> https://cursor.com -> Copy the value of WorkosCursorSessionToken)",
      placeHolder: "Paste cookie value here...",
      password: true,
      ignoreFocusOut: true,
    });

    if (cookieValue && cookieValue.trim()) {
      await context.secrets.store(COOKIE_STORAGE_KEY, cookieValue.trim());
      vscode.window.showInformationMessage(
        "Cursor cookie saved successfully! Fetching usage data...",
      );
      await refreshUsage(context);
    } else {
      vscode.window.showWarningMessage("No cookie value provided.");
    }
  } catch (error: any) {
    console.error(
      `[Cursor Credits Usage] Failed to save cookie: ${error.message}`,
    );
    vscode.window.showErrorMessage(`Failed to save cookie: ${error.message}`);
  }
}

/**
 * Fetches usage summary from the Cursor API and updates the status bar.
 */
async function refreshUsage(context: vscode.ExtensionContext): Promise<void> {
  try {
    const cookie = await context.secrets.get(COOKIE_STORAGE_KEY);
    if (!cookie) {
      statusBar.changeToSetCookieStatusBar();
      vscode.window.showWarningMessage(
        'Cursor cookie not set. Run "Cursor Credits Usage: Set Cookie" from the command palette.',
      );
      return;
    }

    const summary = await fetchUsageSummary(cookie);
    const bucket =
      summary.individualUsage.overall ||
      summary.individualUsage.plan ||
      summary.individualUsage.onDemand;

    console.log(
      `[Cursor Credits Usage] Used: ${bucket.used}, Remaining: ${bucket.remaining}, Limit: ${bucket.limit}`,
    );

    statusBar.updateStatusBar(bucket, summary.billingCycleEnd);
  } catch (error: any) {
    statusBar.setError("Refresh Failed");
    vscode.window.showErrorMessage(`Failed to refresh usage: ${error.message}`);
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
