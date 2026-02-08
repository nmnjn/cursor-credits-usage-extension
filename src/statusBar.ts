import {window, StatusBarAlignment, StatusBarItem, ThemeColor} from "vscode";
import { CAPTURE_COOKIE_COMMAND, REFRESH_USAGE_COMMAND } from "./constants";
import { UsageBucket } from "./models";


let statusBarItem: StatusBarItem;

export function createStatusBarItem(): void {
    statusBarItem = window.createStatusBarItem(
        StatusBarAlignment.Left,
        100
    );
    statusBarItem.command = REFRESH_USAGE_COMMAND;
    statusBarItem.tooltip = "Cursor Credits Usage — click to refresh usage data";
    statusBarItem.text = "$(zap)";
    statusBarItem.show();
}

export function changeToSetCookieStatusBar(): void {
    if (!statusBarItem) {
        return;
    }
    statusBarItem.text = "$(warning) Set Cookie";
    statusBarItem.tooltip = "Cursor Credits Usage — click to set cookie";
    statusBarItem.command = CAPTURE_COOKIE_COMMAND;
}

export function setError(message: string): void {
    if (!statusBarItem) {
        return;
    }
    statusBarItem.text = `$(error) ${message}`;
    statusBarItem.backgroundColor = new ThemeColor(
        "statusBarItem.errorBackground"
    );
    statusBarItem.command = REFRESH_USAGE_COMMAND;
    statusBarItem.tooltip = "Cursor Credits Usage — click to refresh usage data";
}

export function getStatusBarItem(): StatusBarItem {
    return statusBarItem;
}

export function updateStatusBar(
    usage: UsageBucket,
    billingCycleEnd: string
): void {
    if (!statusBarItem) {
        return;
    }

    statusBarItem.command = REFRESH_USAGE_COMMAND;

    const { used, limit, remaining } = usage;
    const usagePercent = limit > 0 ? (used / limit) * 100 : 0;

    // Determine icon and background color based on usage percentage
    let icon = "$(zap)";
    statusBarItem.backgroundColor = undefined;

    if (usagePercent >= 95) {
        icon = "$(error)";
        statusBarItem.backgroundColor = new ThemeColor(
            "statusBarItem.errorBackground"
        );
    } else if (usagePercent >= 80) {
        icon = "$(warning)";
        statusBarItem.backgroundColor = new ThemeColor(
            "statusBarItem.warningBackground"
        );
    }

    const dollarString = function (amount: number): string {
        return `$${(amount / 100).toFixed(2)}`;
    }

    statusBarItem.text = `${icon} ${dollarString(used)} / ${dollarString(limit)}`;

    // Build rich tooltip
    const cycleEnd = new Date(billingCycleEnd);
    const now = new Date();
    const daysRemaining = Math.max(
        0,
        Math.ceil((cycleEnd.getTime() - now.getTime()) / (1000 * 3600 * 24))
    );
    const cycleEndStr = cycleEnd.toISOString().split("T")[0];

    let tooltip = `Cursor AI Usage\n\n`;
    tooltip += `Used: ${dollarString(used)} / ${dollarString(limit)}\n`;
    tooltip += `Remaining: ${dollarString(remaining)}\n`;
    tooltip += `Usage: ${usagePercent.toFixed(1)}%\n\n`;
    tooltip += `Billing cycle ends: ${cycleEndStr} (${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left)\n\n`;

    if (usagePercent >= 95) {
        tooltip += `⚠️ Almost out of requests!\n\n`;
    } else if (usagePercent >= 80) {
        tooltip += `⚠️ Usage is getting high\n\n`;
    }
    statusBarItem.tooltip = tooltip;
}