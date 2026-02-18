import {
  window,
  StatusBarAlignment,
  StatusBarItem,
  ThemeColor,
  MarkdownString,
  ExtensionContext,
} from "vscode";
import {
  REFRESH_USAGE_COMMAND,
  TOGGLE_DISPLAY_MODE_COMMAND,
} from "./constants";
import { UsageBucket } from "./models";

type DisplayMode = "cost" | "percentage";

const DISPLAY_MODE_KEY = "displayMode";

let statusBarItem: StatusBarItem;
let displayMode: DisplayMode = "cost";
let lastUsage: UsageBucket | undefined;
let lastBillingCycleEnd: string | undefined;
let extensionContext: ExtensionContext | undefined;

export function createStatusBarItem(context: ExtensionContext): void {
  extensionContext = context;
  displayMode = context.globalState.get<DisplayMode>(DISPLAY_MODE_KEY) ?? "cost";

  statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
  statusBarItem.command = REFRESH_USAGE_COMMAND;
  statusBarItem.tooltip = "Cursor Credits Usage — click to refresh usage data";
  statusBarItem.text = "$(zap)";
  statusBarItem.show();
}

export function toggleDisplayMode(): void {
  displayMode = displayMode === "cost" ? "percentage" : "cost";
  extensionContext?.globalState.update(DISPLAY_MODE_KEY, displayMode);
  if (lastUsage && lastBillingCycleEnd) {
    updateStatusBar(lastUsage, lastBillingCycleEnd);
  }
}

export function setError(message: string): void {
  if (!statusBarItem) {
    return;
  }
  statusBarItem.text = `$(error) ${message}`;
  statusBarItem.backgroundColor = new ThemeColor(
    "statusBarItem.errorBackground",
  );
  statusBarItem.command = REFRESH_USAGE_COMMAND;
  statusBarItem.tooltip = "Cursor Credits Usage — click to refresh usage data";
}

export function getStatusBarItem(): StatusBarItem {
  return statusBarItem;
}

export function updateStatusBar(
  usage: UsageBucket,
  billingCycleEnd: string,
): void {
  if (!statusBarItem) {
    return;
  }

  // Store latest data so toggle can re-render without re-fetching
  lastUsage = usage;
  lastBillingCycleEnd = billingCycleEnd;

  statusBarItem.command = REFRESH_USAGE_COMMAND;

  const { used, limit, remaining } = usage;
  const usagePercent = limit > 0 ? (used / limit) * 100 : 0;

  // Determine icon and background color based on usage percentage
  let icon = "$(zap)";
  statusBarItem.backgroundColor = undefined;

  if (usagePercent >= 95) {
    icon = "$(error)";
    statusBarItem.backgroundColor = new ThemeColor(
      "statusBarItem.errorBackground",
    );
  } else if (usagePercent >= 80) {
    icon = "$(warning)";
    statusBarItem.backgroundColor = new ThemeColor(
      "statusBarItem.warningBackground",
    );
  } else {
    icon = "";
  }

  const dollarString = function (amount: number): string {
    return `$${(amount / 100).toFixed(2)}`;
  };

  // Render status bar text based on current display mode
  if (displayMode === "cost") {
    statusBarItem.text = `${icon} ${dollarString(used)} / ${dollarString(limit)}`;
  } else {
    statusBarItem.text = `${icon} ${usagePercent.toFixed(1)}% used`;
  }

  // Build rich markdown tooltip with a clickable toggle link
  const cycleEnd = new Date(billingCycleEnd);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((cycleEnd.getTime() - now.getTime()) / (1000 * 3600 * 24)),
  );
  const cycleEndStr = cycleEnd.toISOString().split("T")[0];

  const tooltip = new MarkdownString(undefined, true);
  tooltip.isTrusted = {
    enabledCommands: [TOGGLE_DISPLAY_MODE_COMMAND],
  };

  tooltip.appendMarkdown(`### $(zap) Cursor AI Usage\n\n`);
  tooltip.appendMarkdown(`---\n\n`);

  tooltip.appendMarkdown(
    `|  |  |\n` +
      `|:--|--:|\n` +
      `| **Used** | ${dollarString(used)} / ${dollarString(limit)} |\n` +
      `| **Remaining** | ${dollarString(remaining)} |\n` +
      `| **Usage** | ${usagePercent.toFixed(1)}% |\n\n`,
  );

  tooltip.appendMarkdown(`---\n\n`);
  tooltip.appendMarkdown(
    `$(calendar) Billing cycle ends **${cycleEndStr}** &mdash; ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left\n\n`,
  );

  if (usagePercent >= 95) {
    tooltip.appendMarkdown(`$(warning) **Almost out of requests!**\n\n`);
  } else if (usagePercent >= 80) {
    tooltip.appendMarkdown(`$(warning) **Usage is getting high**\n\n`);
  }

  tooltip.appendMarkdown(`---\n\n`);
  const currentMode = displayMode === "cost" ? "Cost" : "Percentage";
  const nextMode = displayMode === "cost" ? "Percentage" : "Cost";
  tooltip.appendMarkdown(
    `` +
      `[$(sync)&nbsp;&nbsp;Change display mode to ${nextMode}](command:${TOGGLE_DISPLAY_MODE_COMMAND})`,
  );

  statusBarItem.tooltip = tooltip;
}

export function setUnauthenticated(): void {
  if (!statusBarItem) {
    return;
  }
  statusBarItem.text = "$(error) Session Expired";
  statusBarItem.backgroundColor = new ThemeColor(
    "statusBarItem.errorBackground",
  );
  statusBarItem.command = REFRESH_USAGE_COMMAND;

  const tooltip = new MarkdownString(undefined, true);

  tooltip.appendMarkdown(`### $(error) Cursor Credits Usage: Session Expired\n\n`);
  tooltip.appendMarkdown(`---\n\n`);
  tooltip.appendMarkdown(
    `It seems like your Cursor session has expired.\n\n` +
      `Please **logout** and **login** again from Cursor Settings to refresh your credentials.\n\n`,
  );
  tooltip.appendMarkdown(`---\n\n`);
  // tooltip.appendMarkdown(
  //   `[$(gear)&nbsp;&nbsp;Open Cursor Settings](command:${OPEN_CURSOR_SETTINGS_COMMAND})`,
  // );

  statusBarItem.tooltip = tooltip;
}