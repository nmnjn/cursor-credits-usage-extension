import { execSync } from "child_process";
import * as os from "os";
import * as path from "path";

import { type CursorAuthCredentials } from "./models";
import { extractUserIdFromJwt } from "./utils"

/**
 * Returns the path to Cursor's SQLite database based on the current OS.
*/
export const getDBPath = () => {
  const platform = os.platform();

  if (platform === "darwin") {
    return path.join(
      os.homedir(),
      "Library",
      "Application Support",
      "Cursor",
      "User",
      "globalStorage",
      "state.vscdb",
    );
  }

  if (platform === "linux") {
    return path.join(
      os.homedir(),
      ".config",
      "Cursor",
      "User",
      "globalStorage",
      "state.vscdb",
    );
  }

  if (platform === "win32") {
    return path.join(
      process.env.APPDATA || "",
      "Cursor",
      "User",
      "globalStorage",
      "state.vscdb",
    );
  }

  throw new Error(`Unsupported platform: ${platform}`);
};

/**
 * Reads Cursor auth credentials from the local SQLite database using sqlite3 CLI.
 */
export const getAuthCredentials = (): CursorAuthCredentials => {
  const dbPath = getDBPath();
  const query = "SELECT value FROM ItemTable WHERE key = 'cursorAuth/accessToken';";

  const accessToken = execSync(`sqlite3 "${dbPath}" "${query}"`, {
    encoding: "utf-8",
  }).trim();

  if (!accessToken) {
    throw new Error("Access token not found in Cursor database.");
  }

  const userId = extractUserIdFromJwt(accessToken);

  return { userId, accessToken } as const;
};