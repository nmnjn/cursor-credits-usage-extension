# Cursor Credits Usage

Track your Cursor AI credits usage directly in the Cursor IDE status bar. See how much you've used, how much remains, and when your billing cycle resets—without leaving the editor.

![Preview Image](/assets/preview_image.png)

## Features

- **Status bar display** — Shows used vs. limit (e.g. `$4.50 / $20.00`) in the bottom-left status bar. Click it to refresh.
- **Visual alerts** — Icon and background change as you approach your limit (warning at 80%, error at 95%).
- **Rich tooltip** — Hover over the status bar item to see remaining balance, usage percentage, and billing cycle end date.
- **Auto refresh** — Usage is refreshed automatically at a configurable interval (default: 5 minutes).
- **Secure storage** — Your session cookie is stored in the editor’s Secret Storage and never written to disk in plain text.

## Getting Started

### 1. Set your cookie

The extension needs your Cursor session to fetch usage. One-time setup:

1. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2. Run **Cursor Credits Usage: Set Cookie**.
3. Get your cookie:
   - Log in at [cursor.com](https://cursor.com).
   - Open Developer Tools (e.g. **Application** → **Cookies** → `https://cursor.com`).
   - Copy the value of **WorkosCursorSessionToken**.
4. Paste the value when prompted. It is stored securely and used only to call the Cursor usage API.

### 2. View usage

After the cookie is set, the status bar shows your usage (e.g. `$4.50 / $20.00`). Click the status bar item anytime to refresh. If the cookie isn’t set, the status bar shows **Set Cookie** — click it to run the setup.

## Commands

| Command | Description |
|--------|-------------|
| **Cursor Credits Usage: Set Cookie** | Prompt to enter and save your WorkosCursorSessionToken. |
| **Cursor Credits Usage: Refresh Usage** | Manually fetch and update usage in the status bar. |
| **Cursor Credits Usage: Set Polling Interval** | Set how often (in minutes) usage is auto-refreshed. |

## Extension Settings

| Setting | Type | Default | Description |
|--------|------|--------|-------------|
| `cursorCreditsUsage.pollIntervalMinutes` | number | `5` | How often to automatically refresh usage (minutes). Minimum: 1. |

You can also change the polling interval via the command **Cursor Credits Usage: Set Polling Interval**.

## Requirements

- **Cursor IDE** (or VS Code) 1.74.0 or newer.
- A Cursor account; you must be able to log in at [cursor.com](https://cursor.com) to obtain the session cookie.

## Privacy & Security

- The extension only uses your cookie to call `https://cursor.com/api/usage-summary`.
- The cookie is stored in the editor’s Secret Storage API and is not written to disk in plain text.
- No usage data is sent to any third party.

## Known Issues

- If you log out or your Cursor session expires, usage will fail to load. Run **Cursor Credits Usage: Set Cookie** again with a fresh token.
- The Cursor usage API may change; if the status bar stops updating, a new cookie and/or extension update may be required.

## Release Notes

### 0.0.1

Initial release: status bar usage display, cookie setup, manual refresh, and configurable auto-refresh.

---

**Enjoy!**
